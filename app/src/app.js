import express from 'express';
import userRoutes from './contexts/user/api/routes/UserRoutes.js';
import initializeDatabase from './infrastructure/database/initialize.js';

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

export default app;
