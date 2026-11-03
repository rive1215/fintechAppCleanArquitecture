import 'dotenv/config';
import { createApp } from './presentation/app';

const PORT = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(PORT, () => {
  console.log(`Fintech Core App API ejecutándose en http://localhost:${PORT}`);
});
