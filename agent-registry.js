/**
 * Jarvis Agent Registry
 * Central architectural foundation for registering, querying, and managing AI agent capabilities.
 * 
 * Adding a new agent in future phases only requires calling `registerAgent()`
 * with the agent specification without modifying core system logic.
 */

class AgentRegistry {
  constructor() {
    /** @type {Map<string, AgentDefinition>} */
    this.agents = new Map();
    this.initDefaultPlaceholders();
  }

  /**
   * Initializes starter placeholder agents marked as Coming Soon.
   */
  initDefaultPlaceholders() {
    this.registerAgent({
      id: 'system-architect',
      name: 'System Architect',
      description: 'Autonomous desktop operations, process analysis, and background system orchestration.',
      capabilities: ['Process Monitoring', 'File Vault Access', 'System Telemetry', 'Terminal Automation'],
      category: 'System Intelligence',
      enabled: false,
      status: 'Coming Soon',
      phase: 'Phase 3'
    });

    this.registerAgent({
      id: 'web-navigator',
      name: 'Cyber Web Navigator',
      description: 'High-speed headless web research, automated document synthesis, and external API indexing.',
      capabilities: ['Deep Research', 'DOM Extraction', 'Session Persistence', 'Data Harvesting'],
      category: 'Web Automation',
      enabled: false,
      status: 'Coming Soon',
      phase: 'Phase 3'
    });

    this.registerAgent({
      id: 'neural-synthesizer',
      name: 'Neural Code Synthesizer',
      description: 'Multi-lingual source code refactoring, AST parsing, and secure script execution sandboxing.',
      capabilities: ['Code Synthesis', 'Bug Diagnostic', 'Test Suite Runner', 'Git Patch Generation'],
      category: 'Development',
      enabled: false,
      status: 'Coming Soon',
      phase: 'Phase 3'
    });
  }

  /**
   * Register a new agent in the registry.
   * @param {Object} agent
   * @param {string} agent.id
   * @param {string} agent.name
   * @param {string} agent.description
   * @param {string[]} agent.capabilities
   * @param {boolean} [agent.enabled=false]
   * @param {string} agent.category
   * @param {string} [agent.status='Active']
   * @param {string} [agent.phase='Phase 1']
   * @returns {Object} The registered agent
   */
  registerAgent(agent) {
    if (!agent.name || !agent.category) {
      throw new Error('Agent registration requires at least a name and category.');
    }
    const id = agent.id || agent.name.toLowerCase().replace(/\s+/g, '-');
    const agentRecord = {
      id,
      name: agent.name,
      description: agent.description || '',
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
      enabled: Boolean(agent.enabled),
      category: agent.category,
      status: agent.status || 'Active',
      phase: agent.phase || 'Phase 1',
      registeredAt: new Date().toISOString()
    };

    this.agents.set(id, agentRecord);
    return agentRecord;
  }

  /**
   * Retrieves all registered agents.
   * @returns {Array} List of all agent definitions
   */
  getAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Retrieves an agent by its unique ID.
   * @param {string} id 
   * @returns {Object|null}
   */
  getAgentById(id) {
    return this.agents.get(id) || null;
  }

  /**
   * Toggles the enabled state of an agent.
   * @param {string} id 
   * @returns {Object|null}
   */
  toggleAgent(id) {
    const agent = this.agents.get(id);
    if (!agent) return null;
    agent.enabled = !agent.enabled;
    this.agents.set(id, agent);
    return agent;
  }

  /**
   * Sets the explicit enabled state for an agent.
   * @param {string} id 
   * @param {boolean} enabled 
   * @returns {Object|null}
   */
  setAgentEnabled(id, enabled) {
    const agent = this.agents.get(id);
    if (!agent) return null;
    agent.enabled = Boolean(enabled);
    this.agents.set(id, agent);
    return agent;
  }

  /**
   * Removes an agent from the registry.
   * @param {string} id 
   * @returns {boolean}
   */
  unregisterAgent(id) {
    return this.agents.delete(id);
  }
}

// Export singleton instance and class
export const agentRegistry = new AgentRegistry();
export default agentRegistry;
