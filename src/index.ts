import fs from 'fs';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';

const sftp = new SftpClient();

function bytesToMegabytes(bytes: number) {
  return bytes / (1024 * 1024);
}

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
      await sftp.fastPut(localFile, remoteFile, {
        step: (totalTransferred, chunk, total) => {
          const totalTransferredMB =
            bytesToMegabytes(totalTransferred).toFixed(2);
          const totalMB = bytesToMegabytes(total).toFixed(2);
          const percentage = ((totalTransferred / total) * 100).toFixed(2);
          console.log(
            `Uploading progress: ${totalTransferredMB} MB / ${totalMB} MB chunk ${chunk} byte ${percentage}%`,
          );
        },
      });
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
  const s3BucketName = 'ats-sftp-demo-test-bkt';
  const s3UserName = 'LeeJaeHyun-Home';
  const s3Endpoint =
    's-78d9c8c8307046438.server.transfer.ap-northeast-2.amazonaws.com';
  const s3RemoteDir = `/${s3BucketName}/${s3UserName}/`;

  const efsUserName = 'LeeJaeHyun-Mac';
  const efsEndpoint =
    's-30c6fa438c37472ab.server.transfer.ap-northeast-2.amazonaws.com';
  const efsRemoteDir = '/fs-060777736c724d877/mkdir_test';

  const macUploadFolderPath = '/Users/kenken/Upload';
  const macPrivateKeyPath = '/Users/kenken/.ssh/id_rsa';

  const windowsUploadFolderPath = 'c:/Users/KENKEN/Uploads';
  const windowsPrivateKeyPath = 'c:/Users/KENKEN/.ssh/my_key';
  try {
    await connectToSftp(efsEndpoint, efsUserName, macPrivateKeyPath);
    await uploadDirectory(macUploadFolderPath, efsRemoteDir);
    await listRemoteDirectory('/');
  } catch (err) {
    console.error(err);
  } finally {
    await closeSftp();
  }
})();
