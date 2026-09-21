import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.use(helmet({ contentSecurityPolicy: false }));

  // Allow the Vite dev server plus any origins listed in CORS_ORIGINS.
  const configured = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: configured.length
      ? configured
      : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Omid Deldar — Portfolio API')
    .setDescription(
      'The NestJS service behind omiddeldar.dev. Serves the portfolio content ' +
        'and powers the interactive terminal on the site.',
    )
    .setVersion('1.0.0')
    .addTag('profile')
    .addTag('experience')
    .addTag('projects')
    .addTag('skills')
    .addTag('education')
    .addTag('terminal')
    .addTag('stats')
    .addTag('health')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    customSiteTitle: 'Omid Deldar — API Docs',
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`API      → http://localhost:${port}/api`);
  logger.log(`Swagger  → http://localhost:${port}/api/docs`);
}

bootstrap();
