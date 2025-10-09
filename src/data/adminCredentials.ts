// This file simulates server-side admin credentials storage
// In production, this would be a JSON file on the server filesystem
// that is not accessible via web requests and can only be edited
// by someone with source code or server access

export const adminCredentials = [
  { username: 'ir', password: 'ir358@innavs' },
  { username: 'sannu', password: 'sn08@innavs' },
  { username: 'nitish', password: 'Puma_2005' },
];

// Note: In production, passwords should be hashed using bcrypt or similar
// This is stored as plain text only for demonstration purposes