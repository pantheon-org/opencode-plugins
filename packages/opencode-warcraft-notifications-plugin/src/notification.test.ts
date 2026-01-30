import { getAllSounds, getRandomSoundPath, soundExists } from './sounds/index';

const testPlugin = async () => {
  const testSound = 'human_selected1.wav';
  const exists = await soundExists(testSound, 'alliance');

  if (!exists) {
  } else {
  }
  const _allSounds = getAllSounds();

  // Check a few random sounds
  const soundsToCheck = ['human_selected1.wav', 'knight_acknowledge3.wav', 'elf_acknowledge3.wav'];
  for (const sound of soundsToCheck) {
    const _soundExists_ = await soundExists(sound, 'alliance');
  }
  for (let i = 0; i < 3; i++) {
    const randomSoundPath = getRandomSoundPath();
    const _filename = randomSoundPath.split('/').pop();
  }
};

// Run the test only when explicitly enabled via env var
if (process.env.TEST_INTEGRATION === '1') {
  await testPlugin();
}
