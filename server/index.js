const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

// In-memory patient store
// Key: patientId, Value: { patientId, socketId, status, data, submittedAt, lastUpdated }
const patients = new Map();
// Key: socketId, Value: patientId
const socketToPatient = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Handle staff joining
  socket.on('staff:join', () => {
    socket.join('staff');
    console.log(`[Socket.io] Staff joined: ${socket.id}`);
    const allPatients = Array.from(patients.values());
    socket.emit('staff:all_patients', allPatients);
  });

  // Patient joins session
  socket.on('patient:join', (payload) => {
    const patientId = payload?.patientId;
    if (!patientId) return;

    socketToPatient.set(socket.id, patientId);

    let patient = patients.get(patientId);
    if (!patient) {
      patient = {
        patientId,
        socketId: socket.id,
        status: 'inactive',
        data: {},
        lastUpdated: new Date().toISOString()
      };
      patients.set(patientId, patient);
    } else {
      patient.socketId = socket.id;
    }

    console.log(`[Socket.io] Patient joined: ${patientId} (Status: ${patient.status})`);

    // Send current draft state back to joining patient
    socket.emit('patient:draft_sync', {
      patientId,
      data: patient.data,
      status: patient.status
    });

    // Notify staff of patient status
    io.emit('staff:status_change', {
      patientId,
      status: patient.status,
      timestamp: new Date().toISOString()
    });

    io.emit('staff:all_patients', Array.from(patients.values()));
  });

  // Patient streams field updates
  socket.on('patient:field_update', (payload) => {
    if (!payload) return;
    const patientId = payload.patientId || socketToPatient.get(socket.id);
    const field = payload.field;
    const value = payload.value;

    if (!field) return;

    if (patientId) {
      let patient = patients.get(patientId);
      if (!patient) {
        patient = {
          patientId,
          socketId: socket.id,
          status: 'actively_filling_in',
          data: {},
          lastUpdated: new Date().toISOString()
        };
        patients.set(patientId, patient);
      }
      patient.data[field] = value;
      patient.lastUpdated = new Date().toISOString();
    }

    const updatePayload = {
      patientId: patientId || 'unknown',
      field,
      value,
      updatedAt: new Date().toISOString()
    };

    console.log(`[Socket.io] Field update for ${patientId}: ${field}`);
    // Broadcast to staff and legacy listeners
    io.emit('staff:receive_update', updatePayload);
    socket.broadcast.emit('patient:field_update', payload);
  });

  // Patient updates life-cycle status (actively_filling_in, inactive, submitted)
  socket.on('patient:status_change', (payload) => {
    if (!payload || !payload.patientId) return;
    const { patientId, status, timestamp } = payload;
    const patient = patients.get(patientId);
    
    if (patient) {
      patient.status = status;
      patient.lastUpdated = timestamp || new Date().toISOString();
    }

    console.log(`[Socket.io] Status change for ${patientId}: ${status}`);
    io.emit('staff:status_change', {
      patientId,
      status,
      timestamp: timestamp || new Date().toISOString()
    });
  });

  // Patient submits complete form
  socket.on('patient:submit', (payload) => {
    if (!payload) return;
    const patientId = payload.patientId || socketToPatient.get(socket.id);
    const formData = payload.data || payload.patient || payload;
    const submittedAt = payload.submittedAt || new Date().toISOString();

    if (patientId) {
      let patient = patients.get(patientId);
      if (!patient) {
        patient = {
          patientId,
          socketId: socket.id,
          status: 'submitted',
          data: formData,
          submittedAt,
          lastUpdated: submittedAt
        };
        patients.set(patientId, patient);
      } else {
        patient.status = 'submitted';
        patient.data = { ...patient.data, ...formData };
        patient.submittedAt = submittedAt;
        patient.lastUpdated = submittedAt;
      }
    }

    console.log(`[Socket.io] Patient submitted form: ${patientId}`);
    
    const submitPayload = {
      patientId: patientId || 'unknown',
      patient: formData,
      submittedAt,
      status: 'submitted'
    };

    io.emit('staff:patient_submitted', submitPayload);
    io.emit('staff:status_change', {
      patientId: patientId || 'unknown',
      status: 'submitted',
      timestamp: submittedAt
    });
    io.emit('patient:submitted', { status: 'SUCCESS', id: patientId, patient: formData });
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    const patientId = socketToPatient.get(socket.id);
    if (patientId) {
      const patient = patients.get(patientId);
      if (patient && patient.status !== 'submitted') {
        patient.status = 'inactive';
        patient.lastUpdated = new Date().toISOString();
        console.log(`[Socket.io] Patient ${patientId} set to inactive due to disconnect`);
        io.emit('staff:status_change', {
          patientId,
          status: 'inactive',
          timestamp: new Date().toISOString()
        });
      }
      socketToPatient.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Socket.io gateway running on http://localhost:${PORT}`);
});
