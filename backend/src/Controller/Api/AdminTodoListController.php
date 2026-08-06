<?php

namespace App\Controller\Api;

use App\Entity\Task;
use App\Entity\TodoList;
use App\Entity\User;
use App\Service\TaskService;
use App\Service\TodoListService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/todolists', name: 'api_admin_todolists_')]
class AdminTodoListController extends AbstractController
{
    public function __construct(
        private TodoListService $todoListService,
        private TaskService $taskService,
        private EntityManagerInterface $em,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(
        path: '/api/admin/todolists',
        summary: 'List all todo lists (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function list(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);
        $userId = $request->query->get('userId');

        $qb = $this->em->createQueryBuilder()
            ->select('tl', 'u')
            ->from(TodoList::class, 'tl')
            ->leftJoin('tl.user', 'u')
            ->orderBy('tl.createdAt', 'DESC');

        if ($userId) {
            $qb->where('tl.user = :user')
                ->setParameter('user', (int) $userId);
        }

        $totalQb = $this->em->createQueryBuilder()
            ->select('COUNT(tl.id)')
            ->from(TodoList::class, 'tl');

        if ($userId) {
            $totalQb->where('tl.user = :user')
                ->setParameter('user', (int) $userId);
        }

        $results = $qb->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        $total = (int) $totalQb->getQuery()->getSingleScalarResult();

        $data = array_map(function (TodoList $todoList) {
            return [
                'id' => $todoList->getId(),
                'title' => $todoList->getTitle(),
                'description' => $todoList->getDescription(),
                'createdAt' => $todoList->getCreatedAt()->format('c'),
                'updatedAt' => $todoList->getUpdatedAt()->format('c'),
                'user' => [
                    'id' => $todoList->getUser()->getId(),
                    'firstName' => $todoList->getUser()->getFirstName(),
                    'lastName' => $todoList->getUser()->getLastName(),
                    'email' => $todoList->getUser()->getEmail(),
                ],
            ];
        }, $results);

        return $this->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
            ],
        ]);
    }

    #[Route('/user/{userId}', name: 'list_by_user', methods: ['GET'], requirements: ['userId' => '\d+'])]
    #[OA\Get(
        path: '/api/admin/todolists/user/{userId}',
        summary: 'List todo lists for a specific user (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function listByUser(int $userId): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->em->getRepository(User::class)->find($userId);

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = $this->todoListService->findAllByUser($user, 1, 100);

        return $this->json([
            'success' => true,
            'data' => $data['results'],
            'total' => $data['total'],
        ]);
    }

    #[Route('/user/{userId}', name: 'create_for_user', methods: ['POST'], requirements: ['userId' => '\d+'])]
    #[OA\Post(
        path: '/api/admin/todolists/user/{userId}',
        summary: 'Create a todo list for a user (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function createForUser(Request $request, int $userId): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->em->getRepository(User::class)->find($userId);

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), \App\DTO\TodoListRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $todoList = $this->todoListService->create($user, $dto);

        return $this->json([
            'success' => true,
            'data' => $todoList,
            'message' => 'Todo list created successfully.',
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Get(
        path: '/api/admin/todolists/{id}',
        summary: 'Get a todo list (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function show(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $todoList = $this->em->getRepository(TodoList::class)->find($id);

        if (!$todoList) {
            return $this->json([
                'success' => false,
                'message' => 'Todo list not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $todoList->getId(),
            'title' => $todoList->getTitle(),
            'description' => $todoList->getDescription(),
            'createdAt' => $todoList->getCreatedAt()->format('c'),
            'updatedAt' => $todoList->getUpdatedAt()->format('c'),
            'user' => [
                'id' => $todoList->getUser()->getId(),
                'firstName' => $todoList->getUser()->getFirstName(),
                'lastName' => $todoList->getUser()->getLastName(),
                'email' => $todoList->getUser()->getEmail(),
            ],
        ];

        return $this->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[OA\Put(
        path: '/api/admin/todolists/{id}',
        summary: 'Update a todo list (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function update(Request $request, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $todoList = $this->em->getRepository(TodoList::class)->find($id);

        if (!$todoList) {
            return $this->json([
                'success' => false,
                'message' => 'Todo list not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), \App\DTO\TodoListRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $todoList = $this->todoListService->update($todoList, $dto);

        return $this->json([
            'success' => true,
            'data' => $todoList,
            'message' => 'Todo list updated successfully.',
        ]);
    }

    #[Route('/{id}/tasks', name: 'tasks', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Get(
        path: '/api/admin/todolists/{id}/tasks',
        summary: 'List tasks for a todo list (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function tasks(Request $request, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $todoList = $this->em->getRepository(TodoList::class)->find($id);

        if (!$todoList) {
            return $this->json([
                'success' => false,
                'message' => 'Todo list not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);

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

        $results = $qb->getQuery()->getResult();
        $total = (int) $totalQb->getQuery()->getSingleScalarResult();

        $data = array_map(function (Task $task) {
            return [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'description' => $task->getDescription(),
                'status' => $task->getStatus()->value,
                'priority' => $task->getPriority()->value,
                'dueDate' => $task->getDueDate()?->format('c'),
                'todoListId' => $task->getTodoListId(),
                'createdAt' => $task->getCreatedAt()->format('c'),
                'updatedAt' => $task->getUpdatedAt()->format('c'),
            ];
        }, $results);

        return $this->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
            ],
        ]);
    }

    #[Route('/{id}/tasks', name: 'create_task', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[OA\Post(
        path: '/api/admin/todolists/{id}/tasks',
        summary: 'Create a new task in a todo list (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function createTask(Request $request, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $todoList = $this->em->getRepository(TodoList::class)->find($id);

        if (!$todoList) {
            return $this->json([
                'success' => false,
                'message' => 'Todo list not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), \App\DTO\TaskRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->getUser();
        $task = $this->taskService->create($user, $todoList, $dto);

        $data = [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'description' => $task->getDescription(),
            'status' => $task->getStatus()->value,
            'priority' => $task->getPriority()->value,
            'dueDate' => $task->getDueDate()?->format('c'),
            'todoListId' => $task->getTodoListId(),
            'createdAt' => $task->getCreatedAt()->format('c'),
            'updatedAt' => $task->getUpdatedAt()->format('c'),
        ];

        return $this->json([
            'success' => true,
            'data' => $data,
            'message' => 'Task created successfully.',
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[OA\Delete(
        path: '/api/admin/todolists/{id}',
        summary: 'Delete a todo list (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function delete(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $todoList = $this->em->getRepository(TodoList::class)->find($id);

        if (!$todoList) {
            return $this->json([
                'success' => false,
                'message' => 'Todo list not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->todoListService->delete($todoList);

        return $this->json([
            'success' => true,
            'message' => 'Todo list deleted successfully.',
        ]);
    }
}
