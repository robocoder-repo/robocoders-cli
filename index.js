
require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'https://api.robocoders.ai';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

let sessionId = null;

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
    console.log('Full Agent response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error in chat:', error.message);
  }
}

async function main() {
  await createSession();
  console.log('Welcome to the Robocoders.ai CLI!');
  
  const agent = 'GeneralCodingAgent';
  console.log(`Selected agent: ${agent}`);
  
  const prompts = [
    "Write a simple 'Hello, World!' program in Python.",
    "Now, modify the program to accept a name as input and greet the user.",
    "Can you explain how to run this Python script from the command line?"
  ];
  
  for (const prompt of prompts) {
    console.log(`\nSending prompt: "${prompt}"`);
    await chat(prompt, agent);
  }
  
  console.log('\nTest completed. Exiting.');
}

main();
