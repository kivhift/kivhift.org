==========================
Underscore your C/C++ bugs
==========================

:author: Joshua Hughes
:date: 2015-07-17 14:23:45
:summary: A simple method for tracing C/C++ bugs is discussed.

Wouldn't it be great if you could have your bugs tell you where they are in
your C/C++ code?  Well, it turns out that you can; or at least you can leave a
trail of breadcrumbs so that you don't get lost.

Some Background
---------------

When coding in C or C++, you're probably using, at least, the C99 and C++11
standards.  These standards contain features that can be used to create a
simple ``printf``-like macro that you can use to help point out the location of
bugs; specifically, `variadic macros`_, the `predefined identifier`_
``__func__`` and the `predefined macros`_ ``__FILE__`` and ``__LINE__``.

If you've ever used ``printf``, then you're already familiar with variadic
functions.  Variadic macros in C99/C++11 are similar; *i.e.*, they can have an
argument count that isn't fixed.  The variadic part is denoted by an ellipsis
(``...``) at the end of the argument list.  During macro expansion, the
ellipsis arguments replace each occurrence of ``__VA_ARGS__``.

The predefined identifier ``__func__`` is a string containing the name of the
current function.  Simply put, the compiler implicitly declares the identifier
for you as:

.. code:: c

    static const char __func__[] = "function-name";

where *function-name* is the name of the function that contains ``__func__``.
Similarly, ``__FILE__`` is the containing file and ``__LINE__`` is the current
line.

Crumb Culmination
-----------------

Combining the features above, you can create a function-like macro that you can
use to print status messages along with the location in your code where the
messages originate.  The messages can be sprinkled throughout your code to lay
down a trail that can be followed if some problem is encountered.  As an
example, the C/C++ code below defines the macro ``dp`` which prints its
location and message and then flushes the output to make sure that the
information is actually printed instead of buffered.

.. code:: c
    :number-lines:

    #if defined(__cplusplus)
        #include <cstdio>
    #else
        #include <stdio.h>
    #endif

    #if defined(DEBUG)
        #define dp(...) \
            fprintf(stdout, "%s:%s:%d: ", __func__, __FILE__, __LINE__); \
            fprintf(stdout, __VA_ARGS__); \
            fflush(stdout)
    #else
        #define dp(...) do {} while(0)
    #endif

    int to_infinity_and_beyond() {
        int one = 1, zero = 0;

        dp("Returning calculation.\n");
        return one / zero;
    }

    int main() {
        dp("Heading to_infinity_and_beyond().\n");
        int a = to_infinity_and_beyond();
        dp("Back in main(), or are we?...\n");

        return a;
    }

Compiling and running the code without ``-DDEBUG`` results in a crash.  After
invoking::

    gcc -pedantic -Wall -Werror -O0 -std=c99 -DDEBUG eg.c -o eg

we have::

    $> ./eg
    main:eg.c:24: Heading to_infinity_and_beyond().
    to_infinity_and_beyond:eg.c:19: Returning calculation.
    Floating point exception

From this, we can see that the execution made it to ``eg.c:19`` in
``to_infinity_and_beyond`` before it encountered a problem.  Looking at the
line after, the problem is obvious.

Pros and Cons
-------------

The above debugging technique is useful when you want to avoid running under a
debugger.  For example, if you're working on an embedded project, you can send
the output out over a serial connection that's monitored.  For desktop
applications, you can redirect the output to a file to study later or send to a
colleague.  It's also handy to be able to "disable" the macro if needed.

Unfortunately, things aren't perfect.  Space is allocated for ``__func__`` in
your object code.  This, along with the function calls invoked by the macro,
makes the size of your executable increase.  There is also a performance hit as
a result of flushing the output.  Plus, there could be severe problems in
threaded code.  The output could be garbled beyond usability.

Summary
-------

To sum up, features in C99/C++11 allow you to create a function-like macro that
will print a supplied message along with information about the message's
origin.  This, in turn, can be used to create a trail that can be used to
underscore your bugs.

.. _variadic macros: https://en.wikipedia.org/wiki/Variadic_macro
.. _predefined identifier: http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2004/n1642.html
.. _predefined macros: http://gcc.gnu.org/onlinedocs/cpp/Standard-Predefined-Macros.html
