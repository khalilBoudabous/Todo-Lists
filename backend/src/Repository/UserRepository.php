<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function searchUsers(string $query, ?string $role, ?bool $isEnabled, int $page, int $limit): array
    {
        $qb = $this->createQueryBuilder('u');

        if ($query) {
            $qb->andWhere('u.firstName LIKE :query OR u.lastName LIKE :query OR u.email LIKE :query')
                ->setParameter('query', '%' . $query . '%');
        }

        if ($role) {
            $qb->andWhere('JSON_CONTAINS(u.roles, :role) = 1')
                ->setParameter('role', json_encode($role));
        }

        if ($isEnabled !== null) {
            $qb->andWhere('u.isEnabled = :isEnabled')
                ->setParameter('isEnabled', $isEnabled);
        }

        $totalQb = clone $qb;
        $total = (int) $totalQb->select('COUNT(u.id)')->getQuery()->getSingleScalarResult();

        $results = $qb->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return [
            'results' => $results,
            'total' => $total,
        ];
    }
}
