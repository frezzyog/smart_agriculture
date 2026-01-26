-- AI Integration Database Update
-- Copy and Paste this into your Supabase SQL Editor

-- 1. Create Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "DeviceType" AS ENUM ('SENSOR', 'PUMP', 'COMBO');
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'MAINTENANCE');
CREATE TYPE "PumpAction" AS ENUM ('ON', 'OFF', 'AUTO');
CREATE TYPE "AlertLevel" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "AlertType" AS ENUM ('MOISTURE_LOW', 'MOISTURE_CRITICAL', 'TEMPERATURE_HIGH', 'TEMPERATURE_LOW', 'PH_WARNING', 'NPK_LOW', 'EQUIPMENT_FAILURE', 'WEATHER_ALERT', 'HARVEST_READY', 'SYSTEM_INFO');
CREATE TYPE "PredictionType" AS ENUM ('IRRIGATION', 'FERTILIZER', 'MOISTURE_FORECAST', 'WEATHER', 'PEST_RISK', 'HARVEST_TIMING');
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'CUSTOM');
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'EXECUTING', 'COMPLETED', 'CANCELLED', 'FAILED');

-- 2. Create Tables
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "soil_type" TEXT,
    "crop_type" TEXT,
    "optimal_moisture" DOUBLE PRECISION,
    "irrigation_rate" DOUBLE PRECISION,
    "drying_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "zones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "zones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "DeviceStatus" NOT NULL DEFAULT 'INACTIVE',
    "user_id" TEXT NOT NULL,
    "zone_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "devices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "devices_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "sensor_data" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "moisture" DOUBLE PRECISION,
    "rain" DOUBLE PRECISION,
    "light_intensity" DOUBLE PRECISION,
    "nitrogen" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "pH" DOUBLE PRECISION,
    "soil_health" TEXT,
    "stress_level" DOUBLE PRECISION,
    "moisture_loss_rate" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sensor_data_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "pump_logs" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "action" "PumpAction" NOT NULL,
    "duration" INTEGER,
    "triggered_by" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pump_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pump_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT,
    "device_id" TEXT,
    "prediction_type" "PredictionType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "predicted_value" JSONB NOT NULL,
    "valid_until" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "predictions_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "device_id" TEXT,
    "user_id" TEXT NOT NULL,
    "severity" "AlertLevel" NOT NULL,
    "type" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "alerts_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "insights" JSONB,
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "irrigation_schedules" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "water_amount" DOUBLE PRECISION,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "triggered_by" TEXT NOT NULL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "irrigation_schedules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "irrigation_schedules_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "fertilizer_schedules" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "nitrogen_amount" DOUBLE PRECISION,
    "phosphorus_amount" DOUBLE PRECISION,
    "potassium_amount" DOUBLE PRECISION,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "triggered_by" TEXT NOT NULL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fertilizer_schedules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fertilizer_schedules_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Create Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX "devices_device_id_key" ON "devices" ("device_id");
CREATE INDEX "devices_user_id_idx" ON "devices" ("user_id");
CREATE INDEX "devices_device_id_idx" ON "devices" ("device_id");
CREATE INDEX "devices_zone_id_idx" ON "devices" ("zone_id");
CREATE INDEX "sensor_data_device_id_idx" ON "sensor_data" ("device_id");
CREATE INDEX "sensor_data_timestamp_idx" ON "sensor_data" ("timestamp");
CREATE INDEX "pump_logs_device_id_idx" ON "pump_logs" ("device_id");
CREATE INDEX "pump_logs_timestamp_idx" ON "pump_logs" ("timestamp");
CREATE INDEX "zones_user_id_idx" ON "zones" ("user_id");
CREATE INDEX "predictions_zone_id_idx" ON "predictions" ("zone_id");
CREATE INDEX "predictions_prediction_type_idx" ON "predictions" ("prediction_type");
CREATE INDEX "predictions_created_at_idx" ON "predictions" ("created_at");
CREATE INDEX "alerts_user_id_idx" ON "alerts" ("user_id");
CREATE INDEX "alerts_device_id_idx" ON "alerts" ("device_id");
CREATE INDEX "alerts_severity_idx" ON "alerts" ("severity");
CREATE INDEX "alerts_is_read_idx" ON "alerts" ("is_read");
CREATE INDEX "alerts_created_at_idx" ON "alerts" ("created_at");
CREATE INDEX "reports_user_id_idx" ON "reports" ("user_id");
CREATE INDEX "reports_report_type_idx" ON "reports" ("report_type");
CREATE INDEX "reports_period_idx" ON "reports" ("period");
CREATE INDEX "irrigation_schedules_zone_id_idx" ON "irrigation_schedules" ("zone_id");
CREATE INDEX "irrigation_schedules_scheduled_time_idx" ON "irrigation_schedules" ("scheduled_time");
CREATE INDEX "irrigation_schedules_status_idx" ON "irrigation_schedules" ("status");
CREATE INDEX "fertilizer_schedules_zone_id_idx" ON "fertilizer_schedules" ("zone_id");
CREATE INDEX "fertilizer_schedules_scheduled_time_idx" ON "fertilizer_schedules" ("scheduled_time");
CREATE INDEX "fertilizer_schedules_status_idx" ON "fertilizer_schedules" ("status");
