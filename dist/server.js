"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./presentation/app");
const PORT = Number(process.env.PORT ?? 3000);
const app = (0, app_1.createApp)();
app.listen(PORT, () => {
    console.log(`Fintech Core App API ejecutándose en http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map