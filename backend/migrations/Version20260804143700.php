<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260804143700 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add indexes on frequently queried columns for performance';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX idx_users_is_enabled ON users (is_enabled)');
        $this->addSql('CREATE INDEX idx_users_first_name ON users (first_name)');
        $this->addSql('CREATE INDEX idx_users_last_name ON users (last_name)');
        $this->addSql('CREATE INDEX idx_todo_lists_created_at ON todo_lists (created_at)');
        $this->addSql('CREATE INDEX idx_tasks_created_at ON tasks (created_at)');
        $this->addSql('CREATE INDEX idx_tasks_status ON tasks (status)');
        $this->addSql('CREATE INDEX idx_tasks_priority ON tasks (priority)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_users_is_enabled ON users');
        $this->addSql('DROP INDEX idx_users_first_name ON users');
        $this->addSql('DROP INDEX idx_users_last_name ON users');
        $this->addSql('DROP INDEX idx_todo_lists_created_at ON todo_lists');
        $this->addSql('DROP INDEX idx_tasks_created_at ON tasks');
        $this->addSql('DROP INDEX idx_tasks_status ON tasks');
        $this->addSql('DROP INDEX idx_tasks_priority ON tasks');
    }
}
