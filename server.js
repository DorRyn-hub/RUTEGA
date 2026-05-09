// Точка входа Phusion Passenger / Beget Node.js hosting.
// Делегирует управление standalone-серверу Next.js, собранному в .next/standalone.
//
// Команда сборки: npm run build (даёт output: 'standalone' из next.config.ts).
// Перед первым запуском: npx prisma migrate deploy && npx prisma db seed.
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Beget Passenger подставляет порт сам (PORT) и проксирует HTTP — сервер
// должен слушать process.env.PORT.
require("./.next/standalone/server.js");
