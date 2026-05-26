

function generateKey() {
  let key = '';
  const characters = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM'
  
  for (let i = 0; i < 6; i++){
    key += characters[Math.floor(Math.random() * characters.length)];
  }
  return key;
}

export default generateKey;