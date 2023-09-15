================
Random Particles
================

:author: Joshua Hughes
:date: 2022-07-30 12:34:56

Within a field of pseudo-randomly positioned, `moving particles`_, a ball
bounces...

The metric is currently hard-coded as the `Manhattan metric`_. There are two
other metrics in the JavaScript (`Euclidean`_ and `Minkowski`_) but no way to
dynamically select them. I should probably fix that.  Also, some of the
particles in the implementation may be a little less random than others.

Unfortunately, I can't recall where the inspiration for this is from. I think
the project is on `CodePen <https://codepen.io>`_ somewhere but I couldn't find
it when searching for it again. Alas, I should probably keep notes about such
things...

.. _moving particles: {static}/static/particles.html
.. _Manhattan metric: https://en.wikipedia.org/wiki/Taxicab_geometry
.. _Euclidean: https://en.wikipedia.org/wiki/Euclidean_geometry
.. _Minkowski: https://en.wikipedia.org/wiki/Minkowski_distance
