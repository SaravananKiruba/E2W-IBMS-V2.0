<?php

namespace App\Exceptions;

use Exception;

class TenantNotFoundException extends Exception
{
    protected $message = 'Tenant not found';
    protected $code = 404;
}
