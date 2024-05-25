import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const UTIL_DIR = process.cwd();
const PROJECT_DIR = path.join(UTIL_DIR.split('src')[0]);
const DIST_DIR = path.join(PROJECT_DIR, 'dist');
const JIT_DIR = path.join(DIST_DIR, 'tailwind-jit.css');

// /**
//  * 检测指定文件是否存在于 public 目录中，如果不存在则执行指定命令
//  * @param {string} filePath 要检测的文件路径，相对于 public 目录
//  * @param {string} command 要执行的命令
//  * @returns {Promise<void>} 操作完成后的 Promise
//  */
export function checkPublicFileAndExec(filename: string, command: string) {
    const validPath = `${DIST_DIR}/${filename}`;

    return new Promise((resolve, reject) => {
        if (fs.existsSync(validPath)) {
            // console.log(`File ${filename} already exists in public directory.`);
            resolve(`File ${filename} already exists in public directory.`);
        } else {
            // console.log(`File ${filename} not found in public directory. Executing command: _`);
            executeCommand(command);
            reject(`File ${filename} not found in public directory. Executing command: _`);
        }
    });
}
// /**
//  * 执行指定的命令
//  * @param {string} command 要执行的命令
//  * @returns {Promise<void>} 操作完成后的 Promise
//  */
export function executeCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing command: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    });
}

export async function autoGenerateTailwindJIT() {
    try {
        await checkPublicFileAndExec('tailwind.css', `npx tailwindcss -o ${JIT_DIR} --watch`)
        console.log('File check and execute completed.');
    } catch (error) {
        console.error('Error:', error);
    }
}
