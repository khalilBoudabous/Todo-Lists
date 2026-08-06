<?php $c=require 'var/cache/dev/appDevDebugProjectContainer.php'; echo $c->getParameter('kernel.bundles')['TwigBundle'] ?? 'NOT FOUND'; ?>
