# Session 5

## Smoothing (denoising)

### Laplacian smoothing
"Umbrella" operator. 

L(v_i)==Discrete Laplacian of v_i

### Mesh (triangle)
This smethods work for any type of mesh
M=(G,P)
G=Mesh Graph: how vertex are connected
P=Geometry || P belongs to R^{nx3} where n is the number of vertices

G=(V,E)
V={i | 1<=i<=n}
E is inside VxV

### 1-ring neighbourhood
N(i)={j|(i,j) belong to E}

L(v_i)=1/|N(i)| * sum(j belongs to N(i), v_j-v_i)

### Laplacian iterative operator
Update rule == Vi' <- v_i+lambda*L(v_i) where lambda belongs (0,1]

Choosing lambda -> compromise
* Large lambda -> larger steps, faster smoother
* small lambdas -> Avoid vibration

If we look at the behavior, if we have a vertex v_i with normal_i, for a convex vertex we lose area/volume.
On concave vertices we will gain area/volume

In closed shapes, convexity > Concavity
Laplacian == Net lost volume


There are other ways to do the update method.
- Biplacian: takes one step forward and one backward
    vi' = vi+lambda * L(vi)
    vi'' <- vi' - lambda * L(vi')
    
    This method loses less volume.

- Taubin's lambda-mu
    this guy Modified the biplacian 
    vi' <- vi + lambda * L(vi)
    vi'' <- vi' + mu*L(vi')

    1/lambda+1/mu =~ 0.1 -> 10mu +10lambda = lambda mu -> 10mu - 10lambda = -10lambda

    mu = -10lambda/10-lambda

We can also implement matrix form. This will open the door to different smoothing approaches
L=M^-1 * C

C is known as the week laplacian
M is known as the mass matrix, takes into account how many neighbours each vertex has
L laplacian matrix

         |
(C)_ij = |W_ij                            , i != j where (i,j) belong to E
         |-sum(k belongs to N(i), W_i*k)  , i=j 
         | 0                              , otherwise
         |

W_ij = 1 -> Uniform Laplacian

Cotagent laplacian tryes to preserve the distribution of the sampling

W_ij = 1/2 * (cotangent alpha_ij + cotangent Beta_ij )

This does not take into account that some vertex take into account more curvature and others less. 

now we should calculate the mass matrix mentioned before:
- mass matrix for the uniform laplacian
    (M)_ij = ||N(i)|         , i=j
             |  0            , otherwise
- Cotangent
    (M)_ij = | A_i           , i=j
             | 0             , otherwise

    A_i==1/3 sum(Areas of adjancent triangles to v1)


Once we have the matrix definition of L=M^-1*C the update method is simpler
P'=P+lambda L P'
P,P' belongs to R^{nx3}
L belongs to R^{nxm}
lambda belongs to (0,1]

I*P+lambda L P = (I + lambda * L) * P

P' = P+lambda L P 
p'' = p' - lambda L P'
p'' = (P + lambda L P )- lambda L (P + lambda L P) = 
= P+ lambda L P - lambda L P - lambda^2 L^2 P =
= (I-lambda^2 L^2) P 

### Global smoothing approach
The main idea is that the laplacian times P is computing the update vector. FOr each of the points the vector is larger if they are further from the neighbours. 

L*P' =~ 0 -> there is a simple solution -> P'=0; we dont want to turn everithing to 0

keep the update vectors as close to 0 as posible. We will assume that the M 

- Constraint laplacian:
    n first v's -> smooth {v_i | 1 <= i <= n }
    others -> constrain {v_i | m < i <= n }

    1<i <=n -> L(v'_i) = 0
    n<i<=n -> v_i ' = v_i
    
    All this is trying to be interpolative.

    L1 == First m rows of L

    A*P'=B , we can solve this with some matrix problem solver 

We want to create a matrix that contains: 
| L |       | 0 |
|---| P' =  |---|
| I |       | P |

This has 2n rows and n columns

(L^T | I) = ( L ) * p' = (L^t|I)*( 0 )
            (---)                (---)
            ( I )                ( P )  

Weight smoothing vs constraints
(lambda L / I ) P' = (O/P)
mu*I*P'=mu*P


P smooth = (I+Lambda*L)^k1 * P; k1 iterations of laplacian
P low    = (I+lambda*L)^k2 * P k2>k1

P' = Plow + mu (Psmooth- Plow)
mu = 1 -> P'=Psmooth
mu < 1  -> attenuating high frequency details
mu > 1 -> Exaggeratig high frequency details


# Session 6
Mesh parametrization

Attaching properties to a surface, how do we do that?
Unfold the mesh, we generate distortion wit few exceptions (geometrical objects like cube, cylinder)

meshes are a subset of R³. We get [f_x(u,v),f_y(u,v),f_z(u,v)]

what does derivate of f respect to u and derivate of f respect to v represent?

CAD: f's are polynomials or rsteral functions


Output of a mesh parametrization algorithm
It should give the coordinates of each vertex or "Corner". If you give coordinates of a cube for example, vertices have to be flattened out on the domain so each point is inside an image. It is complex to preserve continuity. That is why we create discontinuityes and assign corners to the UV map.

Bijectivity
- global bijectivity
- local bijectivity


Topological equivalence
f continuous:
    S_i virtually equal S_b

    When homeormophism, continuous | continuous inverse | (injection)


Applications : 
- Mesh morphing
- Detail transfer
- Mesh completion