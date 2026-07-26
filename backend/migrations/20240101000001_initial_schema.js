/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // Users table
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name', 255).notNullable();
    t.string('email', 255).unique().notNullable();
    t.string('password_hash', 255).notNullable();
    t.string('role', 50).notNullable().defaultTo('student');
    t.string('target_exam', 255).nullable();
    t.text('avatar').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Quiz results
  await knex.schema.createTable('quiz_results', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('quiz_id', 255).nullable();
    t.timestamp('date').notNullable().defaultTo(knex.fn.now());
    t.integer('score').notNullable().defaultTo(0);
    t.integer('total_questions').notNullable().defaultTo(0);
    t.decimal('percentage', 5, 2).notNullable().defaultTo(0);
    t.integer('time_taken').notNullable().defaultTo(0);
    t.jsonb('time_per_question').defaultTo('[]');
    t.jsonb('topic_accuracy').defaultTo('{}');
    t.jsonb('subject_accuracy').defaultTo('{}');
    t.jsonb('answers').defaultTo('[]');
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('date');
  });

  // Streak / gamification
  await knex.schema.createTable('streak_data', (t) => {
    t.integer('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
    t.integer('current_streak').notNullable().defaultTo(0);
    t.integer('longest_streak').notNullable().defaultTo(0);
    t.date('last_quiz_date').nullable();
    t.integer('total_quizzes_taken').notNullable().defaultTo(0);
    t.integer('total_points').notNullable().defaultTo(0);
    t.jsonb('unlocked_rewards').defaultTo('[]');
    t.boolean('daily_goal_completed').notNullable().defaultTo(false);
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Student self-tasks
  await knex.schema.createTable('tasks', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.boolean('completed').notNullable().defaultTo(false);
    t.timestamp('due_date').nullable();
    t.string('category', 100).defaultTo('study');
    t.string('priority', 50).defaultTo('medium');
    t.string('repeat', 50).defaultTo('none');
    t.jsonb('tags').defaultTo('[]');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('user_id');
  });

  // Daily presence
  await knex.schema.createTable('daily_presence', (t) => {
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.date('date').notNullable();
    t.primary(['user_id', 'date']);

    t.index('user_id');
  });

  // Quiz completions
  await knex.schema.createTable('quiz_completions', (t) => {
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('quiz_id', 255).notNullable();
    t.boolean('completed').notNullable().defaultTo(true);
    t.decimal('score', 5, 2).defaultTo(0);
    t.timestamp('date').defaultTo(knex.fn.now());
    t.integer('duration').defaultTo(15);
    t.primary(['user_id', 'quiz_id']);

    t.index('user_id');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('quiz_completions');
  await knex.schema.dropTableIfExists('daily_presence');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('streak_data');
  await knex.schema.dropTableIfExists('quiz_results');
  await knex.schema.dropTableIfExists('users');
};
