/**
 * Phase 4: New feature tables — courses, quizzes, vocabulary, payments, mentorship sessions, exam notifications, study materials
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // ── Courses ─────────────────────────────────────────────────
  await knex.schema.createTable('courses', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.string('category', 100).notNullable();
    t.string('subcategory', 100).nullable();
    t.string('difficulty', 50).defaultTo('beginner');
    t.string('thumbnail_url', 1000).nullable();
    t.integer('instructor_id').references('id').inTable('users');
    t.string('instructor_name', 255).nullable();
    t.integer('duration_hours').defaultTo(0);
    t.integer('enrolled_count').defaultTo(0);
    t.decimal('rating', 3, 2).defaultTo(0);
    t.boolean('is_published').defaultTo(false);
    t.boolean('is_free').defaultTo(true);
    t.decimal('price', 10, 2).defaultTo(0);
    t.jsonb('tags').defaultTo('[]');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('category');
    t.index('is_published');
    t.index('instructor_id');
  });

  await knex.schema.createTable('course_subjects', (t) => {
    t.increments('id').primary();
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.integer('order_index').defaultTo(0);
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('course_id');
  });

  await knex.schema.createTable('course_chapters', (t) => {
    t.increments('id').primary();
    t.integer('subject_id').notNullable().references('id').inTable('course_subjects').onDelete('CASCADE');
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.string('video_url', 1000).nullable();
    t.integer('duration_minutes').defaultTo(0);
    t.integer('order_index').defaultTo(0);
    t.boolean('is_free_preview').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('subject_id');
  });

  await knex.schema.createTable('course_enrollments', (t) => {
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.decimal('progress_pct', 5, 2).defaultTo(0);
    t.integer('last_chapter_id').nullable();
    t.timestamp('enrolled_at').defaultTo(knex.fn.now());
    t.primary(['user_id', 'course_id']);
  });

  // ── Quiz Catalog ────────────────────────────────────────────
  await knex.schema.createTable('quiz_categories', (t) => {
    t.increments('id').primary();
    t.string('name', 200).notNullable().unique();
    t.string('slug', 200).notNullable().unique();
    t.text('description').nullable();
    t.string('icon', 100).nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('quizzes', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.string('type', 50).notNullable(); // daily, rapid-fire, mini-test, sectional, full-prelims, full-mains, speed-challenge
    t.integer('category_id').references('id').inTable('quiz_categories');
    t.string('subject', 100).nullable();
    t.integer('total_questions').notNullable().defaultTo(0);
    t.integer('duration_minutes').notNullable().defaultTo(15);
    t.integer('max_score').notNullable().defaultTo(0);
    t.string('difficulty', 50).defaultTo('medium'); // easy, medium, hard
    t.string('exam_type', 100).nullable();
    t.boolean('is_published').defaultTo(false);
    t.boolean('is_free').defaultTo(true);
    t.jsonb('metadata').defaultTo('{}');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('category_id');
    t.index('type');
    t.index('is_published');
  });

  await knex.schema.createTable('quiz_questions', (t) => {
    t.increments('id').primary();
    t.integer('quiz_id').notNullable().references('id').inTable('quizzes').onDelete('CASCADE');
    t.text('question_text').notNullable();
    t.string('question_type', 20).defaultTo('mcq'); // mcq, msq, numerical
    t.jsonb('options').defaultTo('[]');
    t.jsonb('correct_answers').defaultTo('[]');
    t.text('explanation').nullable();
    t.string('difficulty', 50).defaultTo('medium');
    t.string('subject', 100).nullable();
    t.string('topic', 200).nullable();
    t.integer('marks').defaultTo(1);
    t.integer('negative_marks').defaultTo(0);
    t.integer('order_index').defaultTo(0);
    t.jsonb('sets').nullable(); // for RC/DI/puzzle shared content
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('quiz_id');
    t.index('subject');
  });

  // ── Blog ────────────────────────────────────────────────────
  await knex.schema.createTable('blogs', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.string('slug', 600).notNullable().unique();
    t.text('content').nullable();
    t.text('excerpt').nullable();
    t.string('author_name', 255).nullable();
    t.integer('author_id').references('id').inTable('users');
    t.string('category', 100).nullable();
    t.jsonb('tags').defaultTo('[]');
    t.string('featured_image', 1000).nullable();
    t.string('status', 30).defaultTo('draft'); // draft, published, archived
    t.boolean('is_ai_generated').defaultTo(false);
    t.integer('reading_time_minutes').defaultTo(0);
    t.integer('views_count').defaultTo(0);
    t.jsonb('seo_meta').defaultTo('{}');
    t.timestamp('published_at').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('slug');
    t.index('status');
    t.index('category');
  });

  // ── Current Affairs ─────────────────────────────────────────
  await knex.schema.createTable('current_affairs', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.text('content').nullable();
    t.text('summary').nullable();
    t.string('category', 100).nullable();
    t.string('topic', 200).nullable();
    t.string('publish_type', 50).defaultTo('news'); // news, daily-news, all-in-one
    t.string('source', 200).nullable();
    t.string('image_url', 1000).nullable();
    t.jsonb('tags').defaultTo('[]');
    t.jsonb('inline_quiz').nullable();
    t.string('status', 30).defaultTo('draft');
    t.integer('created_by').references('id').inTable('users');
    t.timestamp('published_at').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('category');
    t.index('topic');
    t.index('publish_type');
    t.index('status');
    t.index('published_at');
  });

  // ── Vocabulary ──────────────────────────────────────────────
  await knex.schema.createTable('vocabulary_words', (t) => {
    t.increments('id').primary();
    t.string('word', 200).notNullable();
    t.text('definition').notNullable();
    t.text('example').nullable();
    t.string('difficulty', 20).defaultTo('medium'); // easy, medium, hard
    t.string('category', 100).nullable();
    t.jsonb('synonyms').defaultTo('[]');
    t.jsonb('antonyms').defaultTo('[]');
    t.string('pronunciation', 200).nullable();
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('word');
    t.index('difficulty');
    t.index('category');
  });

  await knex.schema.createTable('vocabulary_progress', (t) => {
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('word_id').notNullable().references('id').inTable('vocabulary_words').onDelete('CASCADE');
    t.string('mastery_level', 20).defaultTo('new'); // new, learning, review, mastered
    t.integer('correct_count').defaultTo(0);
    t.integer('incorrect_count').defaultTo(0);
    t.timestamp('next_review_at').nullable();
    t.timestamp('last_reviewed_at').nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.primary(['user_id', 'word_id']);
  });

  // ── Payment / Subscription ──────────────────────────────────
  await knex.schema.createTable('plans', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable(); // free, smart, pro, pro-max
    t.string('display_name', 200).notNullable();
    t.text('description').nullable();
    t.decimal('monthly_price', 10, 2).defaultTo(0);
    t.decimal('yearly_price', 10, 2).defaultTo(0);
    t.jsonb('features').defaultTo('[]');
    t.jsonb('category_access').defaultTo('[]');
    t.jsonb('limits').defaultTo('{}');
    t.boolean('is_active').defaultTo(true);
    t.integer('sort_order').defaultTo(0);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('subscriptions', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('plan_id').notNullable().references('id').inTable('plans');
    t.string('billing_cycle', 20).defaultTo('monthly'); // monthly, yearly
    t.string('status', 30).defaultTo('active'); // active, cancelled, expired, paused
    t.timestamp('starts_at').defaultTo(knex.fn.now());
    t.timestamp('expires_at').nullable();
    t.string('razorpay_subscription_id', 200).nullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('status');
  });

  await knex.schema.createTable('payments', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('subscription_id').references('id').inTable('subscriptions');
    t.decimal('amount', 10, 2).notNullable();
    t.string('currency', 10).defaultTo('INR');
    t.string('status', 30).defaultTo('pending'); // pending, completed, failed, refunded
    t.string('payment_method', 50).nullable();
    t.string('razorpay_order_id', 200).nullable();
    t.string('razorpay_payment_id', 200).nullable();
    t.string('razorpay_signature', 500).nullable();
    t.jsonb('metadata').defaultTo('{}');
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('status');
  });

  await knex.schema.createTable('coupons', (t) => {
    t.increments('id').primary();
    t.string('code', 100).notNullable().unique();
    t.string('description', 500).nullable();
    t.string('discount_type', 20).notNullable(); // percent, fixed
    t.decimal('discount_value', 10, 2).notNullable();
    t.decimal('max_discount_amount', 10, 2).nullable();
    t.integer('min_order_amount', 10, 2).defaultTo(0);
    t.integer('usage_limit').nullable();
    t.integer('used_count').defaultTo(0);
    t.boolean('is_active').defaultTo(true);
    t.timestamp('valid_from').nullable();
    t.timestamp('valid_until').nullable();
    t.jsonb('applicable_to').defaultTo('{}'); // {plan: true, package: false, addon: false}
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('code');
    t.index('is_active');
  });

  // ── Exam Notifications ──────────────────────────────────────
  await knex.schema.createTable('exam_notifications', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.string('exam_name', 200).notNullable();
    t.string('organization', 200).nullable();
    t.string('category', 100).nullable();
    t.date('application_start').nullable();
    t.date('application_end').nullable();
    t.date('exam_date').nullable();
    t.date('admit_card_date').nullable();
    t.date('result_date').nullable();
    t.string('status', 50).defaultTo('upcoming'); // upcoming, ongoing, completed
    t.string('link', 1000).nullable();
    t.jsonb('metadata').defaultTo('{}');
    t.boolean('is_active').defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('category');
    t.index('status');
    t.index('exam_date');
  });

  // ── Study Materials ─────────────────────────────────────────
  await knex.schema.createTable('study_materials', (t) => {
    t.increments('id').primary();
    t.string('title', 500).notNullable();
    t.text('description').nullable();
    t.string('type', 50).notNullable(); // pdf, video, document, link
    t.string('category', 100).nullable();
    t.string('subject', 100).nullable();
    t.string('file_url', 1000).nullable();
    t.integer('file_size_bytes').defaultTo(0);
    t.integer('download_count').defaultTo(0);
    t.integer('created_by').references('id').inTable('users');
    t.boolean('is_free').defaultTo(true);
    t.boolean('is_published').defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());

    t.index('category');
    t.index('type');
    t.index('is_published');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('study_materials');
  await knex.schema.dropTableIfExists('exam_notifications');
  await knex.schema.dropTableIfExists('coupons');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('plans');
  await knex.schema.dropTableIfExists('vocabulary_progress');
  await knex.schema.dropTableIfExists('vocabulary_words');
  await knex.schema.dropTableIfExists('current_affairs');
  await knex.schema.dropTableIfExists('blogs');
  await knex.schema.dropTableIfExists('quiz_questions');
  await knex.schema.dropTableIfExists('quizzes');
  await knex.schema.dropTableIfExists('quiz_categories');
  await knex.schema.dropTableIfExists('course_enrollments');
  await knex.schema.dropTableIfExists('course_chapters');
  await knex.schema.dropTableIfExists('course_subjects');
  await knex.schema.dropTableIfExists('courses');
};
