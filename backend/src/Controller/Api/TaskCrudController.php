<?php

namespace App\Controller\Api;

use App\DTO\TaskRequest;
use App\Entity\Task;
use App\Entity\User;
use App\Service\TaskService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tasks', name: 'api_tasks_')]
class TaskCrudController extends AbstractController
{
    public function __construct(
        private TaskService $taskService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Get(
        path: '/api/tasks/{id}',
        summary: 'Get a task by ID',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function show(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $task = $this->taskService->findById($id);

        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($task->getTodoList()?->getUser()?->getId() !== $user->getId() && !$user->hasRole('ROLE_ADMIN')) {
            return $this->json([
                'success' => false,
                'message' => 'Access denied.',
            ], JsonResponse::HTTP_FORBIDDEN);
        }

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
        ]);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[OA\Put(
        path: '/api/tasks/{id}',
        summary: 'Update a task',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function update(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $task = $this->taskService->findById($id);

        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($task->getTodoList()?->getUser()?->getId() !== $user->getId() && !$user->hasRole('ROLE_ADMIN')) {
            return $this->json([
                'success' => false,
                'message' => 'Access denied.',
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $dto = $this->serializer->deserialize($request->getContent(), TaskRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $task = $this->taskService->update($task, $dto);

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
            'message' => 'Task updated successfully.',
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[OA\Delete(
        path: '/api/tasks/{id}',
        summary: 'Delete a task',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function delete(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $task = $this->taskService->findById($id);

        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($task->getTodoList()?->getUser()?->getId() !== $user->getId() && !$user->hasRole('ROLE_ADMIN')) {
            return $this->json([
                'success' => false,
                'message' => 'Access denied.',
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $this->taskService->delete($task);

        return $this->json([
            'success' => true,
            'message' => 'Task deleted successfully.',
        ]);
    }

    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    #[OA\Patch(
        path: '/api/tasks/{id}/status',
        summary: 'Update task status',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $task = $this->taskService->findById($id);

        if (!$task) {
            return $this->json([
                'success' => false,
                'message' => 'Task not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($task->getTodoList()?->getUser()?->getId() !== $user->getId() && !$user->hasRole('ROLE_ADMIN')) {
            return $this->json([
                'success' => false,
                'message' => 'Access denied.',
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $status = $data['status'] ?? null;

        if (!$status) {
            return $this->json([
                'success' => false,
                'message' => 'Status is required.',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $taskStatus = \App\Enum\TaskStatus::from($status);
        } catch (\ValueError $e) {
            return $this->json([
                'success' => false,
                'message' => 'Invalid status value.',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $task = $this->taskService->updateStatus($task, $taskStatus);

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
            'message' => 'Task status updated successfully.',
        ]);
    }
}
