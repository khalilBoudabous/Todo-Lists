<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\TaskService;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/dashboard', name: 'api_dashboard_')]
class StatsController extends AbstractController
{
    public function __construct(
        private TaskService $taskService,
    ) {
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    #[OA\Get(
        path: '/api/dashboard/stats',
        summary: 'Get dashboard statistics for current user',
        security: [['Bearer' => []]]
    )]
    #[Security(name: 'Bearer')]
    public function stats(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $stats = $this->taskService->getTaskStatistics($user);

        $todoListCount = count($user->getTodoLists());

        $totalTasks = array_sum($stats['status'] ?? []);
        $completedTasks = $stats['status']['completed'] ?? 0;
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

        return $this->json([
            'success' => true,
            'data' => [
                'todoLists' => $todoListCount,
                'tasks' => [
                    'total' => $totalTasks,
                    'completed' => $completedTasks,
                    'completionRate' => $completionRate,
                    'byStatus' => $stats['status'] ?? [],
                    'byPriority' => $stats['priority'] ?? [],
                ],
            ],
        ]);
    }
}
