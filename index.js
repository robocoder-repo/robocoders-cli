
require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

const API_BASE_URL = 'https://api.robocoders.ai';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

let sessionId = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createSession() {
  try {
    const response = await axios.get(`${API_BASE_URL}/create-session`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });
    sessionId = response.data.sid;
    console.log('Session created successfully.');
  } catch (error) {
    console.error('Error creating session:', error.message);
    process.exit(1);
  }
}

async function chat(prompt, agent) {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      sid: sessionId,
      prompt: prompt,
      agent: agent
    }, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });
    console.log('Agent response:', response.data.message);
    return response.data;
  } catch (error) {
    console.error('Error in chat:', error.message);
  }
}

function promptUser(agent) {
  rl.question('Enter your prompt (or "exit" to quit): ', async (prompt) => {
    if (prompt.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    
    await chat(prompt, agent);
    promptUser(agent);
  });
}

async function main() {
  await createSession();
  console.log('Welcome to the Robocoders.ai CLI!');
  
  rl.question('Choose an agent (GeneralCodingAgent, RepoAgent, FrontEndAgent): ', (agent) => {
    console.log(`You've selected ${agent}. You can start chatting now.`);
    promptUser(agent);
  });
}

main();
