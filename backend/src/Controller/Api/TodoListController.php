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

#[Route('/api/todolists', name: 'api_todolists_')]
class TodoListController extends AbstractController
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
        path: '/api/todolists',
        summary: 'List current user todo lists',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function list(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);

        $data = $this->todoListService->findAllByUser($user, $page, $limit);

        $results = array_map(function (TodoList $todoList) {
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
        }, $data['results']);

        return $this->json([
            'success' => true,
            'data' => $results,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $data['total'],
            ],
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[OA\Post(
        path: '/api/todolists',
        summary: 'Create a new todo list',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $dto = $this->serializer->deserialize($request->getContent(), \App\DTO\TodoListRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $todoList = $this->todoListService->create($user, $dto);

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
            'message' => 'Todo list created successfully.',
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Get(
        path: '/api/todolists/{id}',
        summary: 'Get a todo list',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function show(int $id): JsonResponse
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
        path: '/api/todolists/{id}',
        summary: 'Update a todo list',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function update(Request $request, int $id): JsonResponse
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

        $dto = $this->serializer->deserialize($request->getContent(), \App\DTO\TodoListRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $todoList = $this->todoListService->update($todoList, $dto);

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
            'message' => 'Todo list updated successfully.',
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[OA\Delete(
        path: '/api/todolists/{id}',
        summary: 'Delete a todo list',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function delete(int $id): JsonResponse
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

        $this->todoListService->delete($todoList);

        return $this->json([
            'success' => true,
            'message' => 'Todo list deleted successfully.',
        ]);
    }
}
