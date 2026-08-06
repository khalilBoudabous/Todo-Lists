<?php

namespace App\Controller\Api;

use App\DTO\TaskRequest;
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

#[Route('/api/todolists/{id}/tasks', name: 'api_todolist_tasks_')]
class TaskController extends AbstractController
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
        path: '/api/todolists/{id}/tasks',
        summary: 'List tasks for a todo list',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function list(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $todoList = $this->todoListService->findByIdAndUser($id, $user);

        if (!$todoList) {
            return $this->json([
                'success' => false,
                'message' => 'Todo list not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);

        $data = $this->taskService->findAllByTodoList($todoList, $page, $limit);

        return $this->json([
            'success' => true,
            'data' => $data['results'],
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $data['total'],
            ],
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[OA\Post(
        path: '/api/todolists/{id}/tasks',
        summary: 'Create a new task in a todo list',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function create(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $todoList = $this->todoListService->findByIdAndUser($id, $user);

        if (!$todoList) {
            return $this->json([
                'success' => false,
                'message' => 'Todo list not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), TaskRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $task = $this->taskService->create($user, $todoList, $dto);

        return $this->json([
            'success' => true,
            'data' => $task,
            'message' => 'Task created successfully.',
        ], JsonResponse::HTTP_CREATED);
    }
}
