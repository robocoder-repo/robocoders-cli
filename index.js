
require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
const { exec } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');

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
    console.log(chalk.green('Session created successfully.'));
  } catch (error) {
    console.error(chalk.red('Error creating session:', error.message));
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
    
    if (response.data && response.data.message) {
      console.log(chalk.cyan('Agent response:'));
      console.log(chalk.yellow(response.data.message));
    } else {
      console.log(chalk.cyan('Full response:'));
      console.log(chalk.yellow(JSON.stringify(response.data, null, 2)));
    }
    
    await handleAgentActions(response.data);
    
    return response.data;
  } catch (error) {
    console.error(chalk.red('Error in chat:', error.message));
    if (error.response) {
      console.error(chalk.red('Error response:', error.response.data));
    }
  }
}

async function handleAgentActions(data) {
  if (data.action === 'run_ipython' && data.args && data.args.code) {
    const code = data.args.code;
    const createFileRegex = /create_file\('(.+?)',\s*([`'"])([\s\S]+?)\2\)/;
    const match = code.match(createFileRegex);
    if (match) {
      const [, fileName, , fileContent] = match;
      fs.writeFileSync(fileName, fileContent);
      console.log(chalk.green(`File ${fileName} created successfully.`));
    }
  } else if (data.action === 'run' && data.args && data.args.command) {
    await executeCommand(data.args.command);
  }
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error executing command: ${error.message}`));
        reject(error);
      }
      if (stderr) {
        console.error(chalk.yellow(`Command stderr: ${stderr}`));
      }
      console.log(chalk.green(`Command output: ${stdout}`));
      resolve(stdout);
    });
  });
}

function promptUser(agent) {
  rl.question(chalk.magenta('Enter your prompt (or "exit" to quit): '), async (prompt) => {
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
  console.log(chalk.green('Welcome to the Robocoders.ai CLI!'));
  
  rl.question(chalk.magenta('Choose an agent (GeneralCodingAgent, RepoAgent, FrontEndAgent): '), (agent) => {
    console.log(chalk.green(`You've selected ${agent}. You can start chatting now.`));
    promptUser(agent);
  });
}

main();
