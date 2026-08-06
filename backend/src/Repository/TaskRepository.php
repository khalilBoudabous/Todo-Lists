<?php

namespace App\Repository;

use App\Entity\Task;
use App\Enum\TaskPriority;
use App\Enum\TaskStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    public function searchByUser(string $userId, ?string $query, ?TaskStatus $status, ?TaskPriority $priority, ?\DateTimeInterface $dueDateFrom, ?\DateTimeInterface $dueDateTo, int $page, int $limit): array
    {
        if ($page < 1) {
            throw new \InvalidArgumentException('Page must be >= 1.');
        }

        if ($limit < 1) {
            throw new \InvalidArgumentException('Limit must be >= 1.');
        }

        $qb = $this->createQueryBuilder('t')
            ->join('t.todoList', 'tl')
            ->join('tl.user', 'u')
            ->where('u.id = :userId')
            ->setParameter('userId', (int) $userId);

        if ($query) {
            $qb->andWhere('t.title LIKE :query OR t.description LIKE :query')
                ->setParameter('query', '%' . $query . '%');
        }

        if ($status) {
            $qb->andWhere('t.status = :status')
                ->setParameter('status', $status->value);
        }

        if ($priority) {
            $qb->andWhere('t.priority = :priority')
                ->setParameter('priority', $priority->value);
        }

        if ($dueDateFrom) {
            $qb->andWhere('t.dueDate >= :dueDateFrom')
                ->setParameter('dueDateFrom', $dueDateFrom);
        }

        if ($dueDateTo) {
            $qb->andWhere('t.dueDate <= :dueDateTo')
                ->setParameter('dueDateTo', $dueDateTo);
        }

        $qb->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('t.createdAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function countByUser(string $userId, ?string $query, ?TaskStatus $status, ?TaskPriority $priority, ?\DateTimeInterface $dueDateFrom, ?\DateTimeInterface $dueDateTo): int
    {
        $qb = $this->createQueryBuilder('t')
            ->join('t.todoList', 'tl')
            ->join('tl.user', 'u')
            ->where('u.id = :userId')
            ->setParameter('userId', (int) $userId)
            ->select('COUNT(t.id)');

        if ($query) {
            $qb->andWhere('t.title LIKE :query OR t.description LIKE :query')
                ->setParameter('query', '%' . $query . '%');
        }

        if ($status) {
            $qb->andWhere('t.status = :status')
                ->setParameter('status', $status->value);
        }

        if ($priority) {
            $qb->andWhere('t.priority = :priority')
                ->setParameter('priority', $priority->value);
        }

        if ($dueDateFrom) {
            $qb->andWhere('t.dueDate >= :dueDateFrom')
                ->setParameter('dueDateFrom', $dueDateFrom);
        }

        if ($dueDateTo) {
            $qb->andWhere('t.dueDate <= :dueDateTo')
                ->setParameter('dueDateTo', $dueDateTo);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getStatistics(string $userId): array
    {
        $statusQb = $this->createQueryBuilder('t')
            ->join('t.todoList', 'tl')
            ->join('tl.user', 'u')
            ->where('u.id = :userId')
            ->setParameter('userId', (int) $userId)
            ->select('t.status as status', 'COUNT(t.id) as count')
            ->groupBy('t.status');

        $priorityQb = $this->createQueryBuilder('t')
            ->join('t.todoList', 'tl')
            ->join('tl.user', 'u')
            ->where('u.id = :userId')
            ->setParameter('userId', (int) $userId)
            ->select('t.priority as priority', 'COUNT(t.id) as count')
            ->groupBy('t.priority');

        $statusResults = $statusQb->getQuery()->getResult();
        $priorityResults = $priorityQb->getQuery()->getResult();

        $status = [];
        foreach ($statusResults as $row) {
            $status[$row['status']->value] = (int) $row['count'];
        }

        $priority = [];
        foreach ($priorityResults as $row) {
            $priority[$row['priority']->value] = (int) $row['count'];
        }

        return [
            'status' => $status,
            'priority' => $priority,
        ];
    }
}
