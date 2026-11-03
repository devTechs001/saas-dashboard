import express from 'express';
import * as workspaceController from '../controllers/workspaceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Workspaces
router.get('/', workspaceController.listWorkspaces);
router.post('/', workspaceController.createWorkspace);
router.get('/:id', workspaceController.getWorkspace);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

// Members
router.get('/:id/members', workspaceController.listMembers);
router.post('/:id/members', workspaceController.inviteMember);
router.put('/:id/members/:userId', workspaceController.updateMemberRole);
router.delete('/:id/members/:userId', workspaceController.removeMember);

// Tasks (collaboration board per workspace)
router.get('/:id/tasks', workspaceController.listTasks);
router.post('/:id/tasks', workspaceController.createTask);
router.put('/:id/tasks/:taskId', workspaceController.updateTask);
router.delete('/:id/tasks/:taskId', workspaceController.deleteTask);

// Activity feed
router.get('/:id/activity', workspaceController.listActivity);

export default router;
