<?php

namespace App\Service;

use App\DTO\TaskRequest;
use App\Entity\Task;
use App\Entity\TodoList;
use App\Entity\User;
use App\Enum\TaskPriority;
use App\Enum\TaskStatus;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\SerializerInterface;

class TaskService
{
    public function __construct(
        private EntityManagerInterface $em,
        private TaskRepository $taskRepository,
        private SerializerInterface $serializer,
    ) {
    }

    public function create(User $user, TodoList $todoList, TaskRequest $request): Task
    {
        $task = new Task();
        $task->setTitle($request->title);
        $task->setDescription($request->description);
        $task->setStatus(TaskStatus::from($request->status));
        $task->setPriority(TaskPriority::from($request->priority));
        $task->setDueDate($request->dueDate !== null ? new \DateTimeImmutable($request->dueDate) : null);
        $task->setTodoList($todoList);

        $this->em->persist($task);
        $this->em->flush();

        return $task;
    }

    public function findAllByTodoList(TodoList $todoList, int $page, int $limit): array
    {
        $qb = $this->em->createQueryBuilder()
            ->select('t')
            ->from(Task::class, 't')
            ->where('t.todoList = :todoList')
            ->setParameter('todoList', $todoList)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('t.createdAt', 'DESC');

        $totalQb = $this->em->createQueryBuilder()
            ->select('COUNT(t.id)')
            ->from(Task::class, 't')
            ->where('t.todoList = :todoList')
            ->setParameter('todoList', $todoList);

        return [
            'results' => $qb->getQuery()->getResult(),
            'total' => (int) $totalQb->getQuery()->getSingleScalarResult(),
        ];
    }

    public function findById(int $id): ?Task
    {
        return $this->em->getRepository(Task::class)->find($id);
    }

    public function update(Task $task, TaskRequest $request): Task
    {
        $task->setTitle($request->title);
        $task->setDescription($request->description);
        $task->setStatus(TaskStatus::from($request->status));
        $task->setPriority(TaskPriority::from($request->priority));
        $task->setDueDate($request->dueDate !== null ? new \DateTimeImmutable($request->dueDate) : null);

        $this->em->flush();

        return $task;
    }

    public function delete(Task $task): void
    {
        $this->em->remove($task);
        $this->em->flush();
    }

    public function updateStatus(Task $task, TaskStatus $status): Task
    {
        $task->setStatus($status);

        $this->em->flush();

        return $task;
    }

    public function searchTasks(User $user, ?string $query, ?TaskStatus $status, ?TaskPriority $priority, ?\DateTimeInterface $dueDateFrom, ?\DateTimeInterface $dueDateTo, int $page, int $limit): array
    {
        $results = $this->taskRepository->searchByUser(
            (string) $user->getId(),
            $query,
            $status,
            $priority,
            $dueDateFrom,
            $dueDateTo,
            $page,
            $limit
        );

        $total = $this->taskRepository->countByUser(
            (string) $user->getId(),
            $query,
            $status,
            $priority,
            $dueDateFrom,
            $dueDateTo
        );

        return [
            'results' => $results,
            'total' => $total,
        ];
    }

    public function getTaskStatistics(User $user): array
    {
        return $this->taskRepository->getStatistics((string) $user->getId());
    }
}
