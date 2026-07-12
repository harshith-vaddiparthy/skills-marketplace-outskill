CREATE TYPE "public"."finding_severity" AS ENUM('info', 'low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."finding_source" AS ENUM('deterministic', 'llm');--> statement-breakpoint
CREATE TYPE "public"."scan_layer" AS ENUM('hidden_text', 'dangerous_pattern', 'script_analysis', 'llm_injection');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."skill_source" AS ENUM('upload', 'github');--> statement-breakpoint
CREATE TYPE "public"."skill_status" AS ENUM('draft', 'published', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."trust_tier" AS ENUM('verified_safe', 'caution', 'blocked', 'pending');--> statement-breakpoint
CREATE TABLE "finding" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_result_id" text NOT NULL,
	"layer" "scan_layer" NOT NULL,
	"severity" "finding_severity" NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"file_path" text,
	"location" jsonb,
	"evidence" text,
	"confidence" real,
	"source" "finding_source" DEFAULT 'deterministic' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scan_result" (
	"id" text PRIMARY KEY NOT NULL,
	"skill_version_id" text NOT NULL,
	"overall_risk_score" integer DEFAULT 0 NOT NULL,
	"trust_tier" "trust_tier" DEFAULT 'pending' NOT NULL,
	"scanner_version" text NOT NULL,
	"classifier_model" text,
	"status" "scan_status" DEFAULT 'completed' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"duration_ms" integer,
	"summary" jsonb,
	"layer_status" jsonb
);
--> statement-breakpoint
CREATE TABLE "skill" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"author_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"summary" text,
	"status" "skill_status" DEFAULT 'draft' NOT NULL,
	"latest_trust_tier" "trust_tier" DEFAULT 'pending' NOT NULL,
	"current_version_id" text,
	"source" "skill_source" DEFAULT 'upload' NOT NULL,
	"source_url" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"price_cents" integer,
	"is_paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skill_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skill_file" (
	"id" text PRIMARY KEY NOT NULL,
	"skill_version_id" text NOT NULL,
	"path" text NOT NULL,
	"content" text NOT NULL,
	"content_type" text DEFAULT 'text/markdown' NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"sha256" text NOT NULL,
	"is_executable" boolean DEFAULT false NOT NULL,
	"storage_key" text
);
--> statement-breakpoint
CREATE TABLE "skill_version" (
	"id" text PRIMARY KEY NOT NULL,
	"skill_id" text NOT NULL,
	"version" integer NOT NULL,
	"content_hash" text NOT NULL,
	"frontmatter_name" text NOT NULL,
	"frontmatter_description" text NOT NULL,
	"skill_md_body" text NOT NULL,
	"trust_tier" "trust_tier" DEFAULT 'pending' NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"scanner_version" text NOT NULL,
	"scan_result_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finding" ADD CONSTRAINT "finding_scan_result_id_scan_result_id_fk" FOREIGN KEY ("scan_result_id") REFERENCES "public"."scan_result"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_result" ADD CONSTRAINT "scan_result_skill_version_id_skill_version_id_fk" FOREIGN KEY ("skill_version_id") REFERENCES "public"."skill_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_file" ADD CONSTRAINT "skill_file_skill_version_id_skill_version_id_fk" FOREIGN KEY ("skill_version_id") REFERENCES "public"."skill_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_version" ADD CONSTRAINT "skill_version_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "skill_version_skill_hash_idx" ON "skill_version" USING btree ("skill_id","content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_version_skill_version_idx" ON "skill_version" USING btree ("skill_id","version");