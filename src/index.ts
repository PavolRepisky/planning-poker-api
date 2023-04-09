import server from './app';
import config from './config/config';

server.listen(config.server.port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${config.server.port}`);
});
