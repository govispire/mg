/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // Extend users table
  await knex.schema.alterTable('users', (t) => {
    t.string('status', 20).notNullable().defaultTo('active');
    t.integer('created_by').references('id').inTable('users');
    t.string('phone', 20).nullable();
    t.string('department', 100).nullable();
    t.timestamp('deactivated_at').nullable();
    t.integer('deactivated_by').references('id').inTable('users');
    t.timestamp('last_login_at').nullable();
    t.integer('employee_capacity').defaultTo(0);
  });

  // Staff tasks (admin-to-employee/mentor assignment)
  await knex.schema.createTable('staff_tasks', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.integer('assigned_by').notNullable().references('id').inTable('users');
    t.integer('assigned_to').notNullable().references('id').inTable('users');
    t.string('assignee_role', 50).notNullable();
    t.string('category', 100).nullable();
    t.string('priority', 20).notNullable().defaultTo('medium');
    t.string('status', 30).notNullable().defaultTo('assigned');
    t.timestamp('due_date').nullable();
    t.text('proof_url').nullable();
    t.boolean('extension_requested').defaultTo(false);
    t.text('extension_reason').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.timestamp('completed_at').nullable();

    t.index('assigned_to');
    t.index('assigned_by');
    t.index('status');
    t.index('due_date');
  });

  // Staff task activity logs
  await knex.schema.createTable('staff_task_logs', (t) => {
    t.increments('id').primary();
    t.integer('task_id').notNullable().references('id').inTable('staff_tasks').onDelete('CASCADE');
    t.integer('actor_id').notNullable().references('id').inTable('users');
    t.string('action', 100).notNullable();
    t.text('old_value').nullable();
    t.text('new_value').nullable();
    t.text('comment').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('task_id');
  });

  // Audit logs
  await knex.schema.createTable('audit_logs', (t) => {
    t.increments('id').primary();
    t.integer('actor_id').references('id').inTable('users');
    t.string('actor_role', 50).nullable();
    t.string('action', 200).notNullable();
    t.string('resource_type', 100).nullable();
    t.string('resource_id', 100).nullable();
    t.text('resource_name').nullable();
    t.jsonb('old_data').nullable();
    t.jsonb('new_data').nullable();
    t.string('ip_address', 50).nullable();
    t.text('user_agent').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('actor_id');
    t.index(['resource_type', 'resource_id']);
    t.index('created_at');
  });

  // Notifications
  await knex.schema.createTable('notifications', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title', 300).notNullable();
    t.text('body').nullable();
    t.string('type', 50).defaultTo('info');
    t.boolean('is_read').defaultTo(false);
    t.text('link').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index(['user_id', 'is_read']);
  });

  // Employee performance
  await knex.schema.createTable('employee_performance', (t) => {
    t.integer('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
    t.integer('total_tasks').defaultTo(0);
    t.integer('completed_tasks').defaultTo(0);
    t.integer('overdue_tasks').defaultTo(0);
    t.decimal('avg_completion_days', 5, 2).defaultTo(0);
    t.integer('content_uploads').defaultTo(0);
    t.integer('approved_uploads').defaultTo(0);
    t.integer('rejected_uploads').defaultTo(0);
    t.decimal('quality_score', 5, 2).defaultTo(0);
    t.decimal('performance_score', 5, 2).defaultTo(0);
    t.timestamp('last_calculated_at').defaultTo(knex.fn.now());
  });

  // Mentor-student mapping
  await knex.schema.createTable('mentor_student_map', (t) => {
    t.integer('mentor_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('assigned_by').references('id').inTable('users');
    t.string('category', 100).nullable();
    t.timestamp('assigned_at').defaultTo(knex.fn.now());
    t.primary(['mentor_id', 'student_id']);

    t.index('mentor_id');
  });

  // Student weak areas
  await knex.schema.createTable('student_weak_areas', (t) => {
    t.increments('id').primary();
    t.integer('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('topic', 200).notNullable();
    t.string('subject', 100).nullable();
    t.decimal('accuracy_pct', 5, 2).defaultTo(0);
    t.integer('attempt_count').defaultTo(0);
    t.string('trend', 20).defaultTo('stable');
    t.boolean('flagged').defaultTo(true);
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Mentor recommendations
  await knex.schema.createTable('mentor_recommendations', (t) => {
    t.increments('id').primary();
    t.integer('student_id').notNullable().references('id').inTable('users');
    t.integer('mentor_id').references('id').inTable('users');
    t.integer('weak_area_id').references('id').inTable('student_weak_areas');
    t.text('message').notNullable();
    t.string('resource_type', 50).nullable();
    t.string('resource_id', 200).nullable();
    t.string('resource_title', 300).nullable();
    t.timestamp('sent_at').nullable();
    t.boolean('clicked').defaultTo(false);
    t.boolean('purchased').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Content items (CMS with approval workflow)
  await knex.schema.createTable('content_items', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.string('type', 50).notNullable();
    t.string('category', 100).nullable();
    t.string('subject', 100).nullable();
    t.string('status', 30).defaultTo('draft');
    t.integer('created_by').notNullable().references('id').inTable('users');
    t.integer('reviewed_by').references('id').inTable('users');
    t.integer('published_by').references('id').inTable('users');
    t.integer('archived_by').references('id').inTable('users');
    t.integer('current_owner').references('id').inTable('users');
    t.text('reject_reason').nullable();
    t.text('archive_reason').nullable();
    t.timestamp('published_at').nullable();
    t.timestamp('archived_at').nullable();
    t.timestamp('reviewed_at').nullable();
    t.jsonb('content_data').defaultTo('{}');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('created_by');
    t.index('status');
  });

  // Login history
  await knex.schema.createTable('login_history', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('ip_address', 50).nullable();
    t.text('user_agent').nullable();
    t.string('status', 20).defaultTo('success');
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('user_id');
  });

  // Add governance indexes to users
  await knex.schema.alterTable('users', (t) => {
    t.index('status');
    t.index('role');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('login_history');
  await knex.schema.dropTableIfExists('content_items');
  await knex.schema.dropTableIfExists('mentor_recommendations');
  await knex.schema.dropTableIfExists('student_weak_areas');
  await knex.schema.dropTableIfExists('mentor_student_map');
  await knex.schema.dropTableIfExists('employee_performance');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('staff_task_logs');
  await knex.schema.dropTableIfExists('staff_tasks');

  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('status');
    t.dropColumn('created_by');
    t.dropColumn('phone');
    t.dropColumn('department');
    t.dropColumn('deactivated_at');
    t.dropColumn('deactivated_by');
    t.dropColumn('last_login_at');
    t.dropColumn('employee_capacity');
  });
};
