<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Enum\TaskPriority;
use App\Enum\TaskStatus;
use App\Entity\TodoList;
use App\Entity\Task;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $passwordHasher) {}

    public function load(ObjectManager $manager): void
    {
        $admin = new User();
        $admin->setFirstName('Admin');
        $admin->setLastName('User');
        $admin->setEmail('admin@example.com');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'password'));
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setIsEnabled(true);
        $manager->persist($admin);

        $user = new User();
        $user->setFirstName('John');
        $user->setLastName('Doe');
        $user->setEmail('user@example.com');
        $user->setPassword($this->passwordHasher->hashPassword($user, 'password'));
        $user->setRoles(['ROLE_USER']);
        $user->setIsEnabled(true);
        $manager->persist($user);

        $todoList1 = new TodoList();
        $todoList1->setTitle('Personal Tasks');
        $todoList1->setDescription('My personal task list');
        $todoList1->setUser($user);
        $manager->persist($todoList1);

        $todoList2 = new TodoList();
        $todoList2->setTitle('Work Tasks');
        $todoList2->setDescription('Work related tasks');
        $todoList2->setUser($user);
        $manager->persist($todoList2);

        $task1 = new Task();
        $task1->setTitle('Complete project documentation');
        $task1->setDescription('Write comprehensive docs for the API');
        $task1->setStatus(TaskStatus::InProgress);
        $task1->setPriority(TaskPriority::High);
        $task1->setDueDate(new \DateTimeImmutable('+3 days'));
        $task1->setTodoList($todoList1);
        $manager->persist($task1);

        $task2 = new Task();
        $task2->setTitle('Review pull requests');
        $task2->setDescription('Review open PRs on GitHub');
        $task2->setStatus(TaskStatus::Pending);
        $task2->setPriority(TaskPriority::Medium);
        $task2->setDueDate(new \DateTimeImmutable('+1 week'));
        $task2->setTodoList($todoList2);
        $manager->persist($task2);

        $task3 = new Task();
        $task3->setTitle('Update dependencies');
        $task3->setDescription('Update npm and composer dependencies');
        $task3->setStatus(TaskStatus::Completed);
        $task3->setPriority(TaskPriority::Low);
        $task3->setTodoList($todoList1);
        $manager->persist($task3);

        $manager->flush();
    }
}
