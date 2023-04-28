import config from 'config';
import server from './app';

const port = config.get<number>('port');

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
