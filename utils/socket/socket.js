let io = null;

export const initialize = (socketIo) => {
    io = socketIo;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Must call .initialize(server) before you can call .getIO()");
    }
    return io;
};

// Emit to a specific room
export const emitMessageToRoom = (room, eventEmitterName, messageBody) => {
    io.to(room).emit(eventEmitterName, messageBody);
};

// Broadcast to all connected clients
export const broadcastMessage = (eventEmitterName, messageBody) => {
    if (io) {
        io.emit(eventEmitterName, messageBody);
    }
};
