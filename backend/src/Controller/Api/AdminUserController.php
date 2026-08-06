<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/users', name: 'api_admin_users_')]
class AdminUserController extends AbstractController
{
    public function __construct(
        private UserService $userService,
        private EntityManagerInterface $em,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(
        path: '/api/admin/users',
        summary: 'List users (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function list(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);
        $query = $request->query->get('query');
        $role = $request->query->get('role');
        $isEnabled = $request->query->get('isEnabled');

        if ($isEnabled !== null) {
            $isEnabled = filter_var($isEnabled, FILTER_VALIDATE_BOOLEAN);
        }

        $data = $this->userService->searchUsers($query, $role, $isEnabled, $page, $limit);

        $users = array_map(
            fn(User $user) => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $user->getRoles(),
                'isEnabled' => $user->isEnabled(),
                'createdAt' => $user->getCreatedAt()?->format(\DateTime::ATOM),
            ],
            $data['results']
        );

        return $this->json([
            'success' => true,
            'data' => $users,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $data['total'],
            ],
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[OA\Post(
        path: '/api/admin/users',
        summary: 'Create a user (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $dto = $this->serializer->deserialize($request->getContent(), \App\DTO\UserRegistrationRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->userService->register($dto);

        return $this->json([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ],
            'message' => 'User created successfully.',
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Get(
        path: '/api/admin/users/{id}',
        summary: 'Get a user (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function show(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $user->getRoles(),
                'isEnabled' => $user->isEnabled(),
            ],
        ]);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[OA\Put(
        path: '/api/admin/users/{id}',
        summary: 'Update a user (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function update(Request $request, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), \App\DTO\UserProfileUpdateRequest::class, 'json');
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => (string) $errors,
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user->setFirstName($dto->firstName);
        $user->setLastName($dto->lastName);
        $user->setUpdatedAt(new \DateTimeImmutable());

        $this->em->flush();

        return $this->json([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ],
            'message' => 'User updated successfully.',
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[OA\Delete(
        path: '/api/admin/users/{id}',
        summary: 'Delete a user (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function delete(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($user);
        $this->em->flush();

        return $this->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    #[Route('/{id}/role', name: 'update_role', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    #[OA\Patch(
        path: '/api/admin/users/{id}/role',
        summary: 'Update user role (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $role = $data['role'] ?? null;

        if (!$role || !is_string($role)) {
            return $this->json([
                'success' => false,
                'message' => 'Role is required.',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user->setRoles([strtoupper($role)]);
        $this->em->flush();

        return $this->json([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'roles' => $user->getRoles(),
            ],
            'message' => 'User role updated successfully.',
        ]);
    }

    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    #[OA\Patch(
        path: '/api/admin/users/{id}/status',
        summary: 'Update user status (admin only)',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not found.',
            ], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $isEnabled = $data['isEnabled'] ?? null;

        if ($isEnabled === null || !is_bool($isEnabled)) {
            return $this->json([
                'success' => false,
                'message' => 'isEnabled boolean is required.',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user->setIsEnabled($isEnabled);
        $this->em->flush();

        return $this->json([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'isEnabled' => $user->isEnabled(),
            ],
            'message' => 'User status updated successfully.',
        ]);
    }
}
