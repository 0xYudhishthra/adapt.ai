import { AgentService } from '../services/agent';

const agentService = new AgentService();

export const registerAgent = async (req: any, res: any) => {
    try {
        const agent = await agentService.registerAgent(req.body);
        return res.status(201).json({
            success: true,
            data: agent
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: (error as Error).message
        });
    }
};

export const getAgent = async (req: any, res: any) => {
    try {
        const { data, error } = await agentService.supabase
            .from('agents')
            .select('*')
            .eq('agent_id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Agent not found');

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: (error as Error).message
        });
    }
}; 