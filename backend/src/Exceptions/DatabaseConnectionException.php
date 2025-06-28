<?php

namespace App\Exceptions;

use Exception;

class DatabaseConnectionException extends Exception
{
    protected $message = 'Database connection failed';
    protected $code = 500;
}
