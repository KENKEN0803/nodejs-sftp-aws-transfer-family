import fs from 'fs';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';

const sftp = new SftpClient();

// Connect to SFTP
async function connectToSftp(
  host: string,
  username: string,
  privateKeyPath: string,
) {
  console.log('Starting connection...');
  console.log(`Connecting to ${host} with username ${username}`);
  const privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
  await sftp.connect({
    host,
    username,
    privateKey,
  });
}

// Close SFTP connection
async function closeSftp() {
  console.log('Closing connection...');
  await sftp.end();
}

// Upload directory
async function uploadDirectory(localDir: string, remoteDir: string) {
  console.log('Starting upload...');
  console.log(`Uploading directory ${localDir} to ${remoteDir}`);
  try {
    const files = fs.readdirSync(localDir);
    for (const file of files) {
      const localFile = path.join(localDir, file);
      const remoteFile = path.join(remoteDir, file);
      console.log(`Uploading ${localFile} to ${remoteFile}`);
      await sftp.put(localFile, remoteFile);
      console.log(`Upload completed for ${localFile}`);
    }
  } catch (err) {
    console.error(err);
  }
}

// List remote directory
async function listRemoteDirectory(remoteDir: string) {
  console.log('Starting listing remote directory...');
  console.log(`Listing directory ${remoteDir}`);
  try {
    const list = await sftp.list(remoteDir);
    console.log(list);
  } catch (err) {
    console.error(err);
  }
}

// Usage
(async () => {
  try {
    await connectToSftp(
      's-78d9c8c8307046438.server.transfer.ap-northeast-2.amazonaws.com',
      'LeeJaeHyun-Home',
      'c:/Users/KENKEN/.ssh/my_key',
    );
    await uploadDirectory('c:/Users/KENKEN/Uploads', '');
    await listRemoteDirectory('/ats-sftp-demo-test-bkt/LeeJaeHyun-Home/');
  } catch (err) {
    console.error(err);
  } finally {
    await closeSftp();
  }
})();
