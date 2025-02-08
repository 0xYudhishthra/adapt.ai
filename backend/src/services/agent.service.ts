import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface Agent {
    id?: number;
    agent_id?: number;
    description: string;
    api_url: string;
    created_at?: string;
}

export class AgentService {
    supabase: SupabaseClient;
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
    }

    async registerAgent(agent: Agent): Promise<Agent> {
        console.log(agent);
       // Check if agent already exists
       const { data, error } = await this.supabase
        .from('agents')
        .select('*')
        .eq('agent_id', agent.agent_id);

        if (error) {
            console.error(error);
            throw new Error(error.message);
        }

        if (data.length > 0) {
            throw new Error('Agent already exists');
        }

        // Insert new agent
        const { data: newAgent, error: newAgentError } = await this.supabase
        .from('agents')
        .insert({
            agent_id: agent.agent_id,
            description: agent.description,
            api_url: agent.api_url
        })

        if (newAgentError) {
            throw new Error(newAgentError.message);
        }

        const { data: newAgentFind, error: newAgentErrorFind } = await this.supabase
        .from('agents')
        .select('*')
        .eq('agent_id', agent.agent_id)
        .single() as { data: Agent | null, error: any };

        if (!newAgentFind) {
            throw new Error('Failed to register agent');
        }

        const parsedAgent = {
            agent_id: newAgentFind.agent_id,
            description: newAgentFind.description,
            api_url: newAgentFind.api_url,
            created_at: newAgentFind.created_at
        };

        return parsedAgent;
    }
}