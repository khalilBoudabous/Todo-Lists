<?php

namespace App\Service;

use App\DTO\TodoListRequest;
use App\Entity\TodoList;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\SerializerInterface;

class TodoListService
{
    public function __construct(
        private EntityManagerInterface $em,
        private SerializerInterface $serializer,
    ) {
    }

    public function create(User $user, TodoListRequest $request): TodoList
    {
        $todoList = new TodoList();
        $todoList->setTitle($request->title);
        $todoList->setDescription($request->description);
        $todoList->setUser($user);

        $this->em->persist($todoList);
        $this->em->flush();

        return $todoList;
    }

    public function findAllByUser(User $user, int $page, int $limit): array
    {
        $qb = $this->em->createQueryBuilder()
            ->select('tl', 'u')
            ->from(TodoList::class, 'tl')
            ->leftJoin('tl.user', 'u')
            ->where('tl.user = :user')
            ->setParameter('user', $user)
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->orderBy('tl.createdAt', 'DESC');

        $totalQb = $this->em->createQueryBuilder()
            ->select('COUNT(tl.id)')
            ->from(TodoList::class, 'tl')
            ->where('tl.user = :user')
            ->setParameter('user', $user);

        return [
            'results' => $qb->getQuery()->getResult(),
            'total' => (int) $totalQb->getQuery()->getSingleScalarResult(),
        ];
    }

    public function findByIdAndUser(int $id, User $user): ?TodoList
    {
        return $this->em->getRepository(TodoList::class)->findOneBy([
            'id' => $id,
            'user' => $user,
        ]);
    }

    public function update(TodoList $todoList, TodoListRequest $request): TodoList
    {
        $todoList->setTitle($request->title);
        $todoList->setDescription($request->description);

        $this->em->flush();

        return $todoList;
    }

    public function delete(TodoList $todoList): void
    {
        $this->em->remove($todoList);
        $this->em->flush();
    }
}
