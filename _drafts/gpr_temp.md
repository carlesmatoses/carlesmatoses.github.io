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

# Session 7

Distorsion
Continuous domain, continuous diferentiable

for some reason there is a note in the board that says "jacobian neuron?

We are presented with a square with size (u,v) that belongs to R². It can be transformed to R³ with a continuous diferentiable equation

||v|| = (alpha f u + beta f u)*(alpha f u + beta f u)= x²fu² + 2 alpha beta fu* fv alpha beta² fv²

v^t I *v = [alpha, beta] I [[alpha][beta]]

dd (I-S id)=0   with this we also know that (E-S)*(G-S)-F² = 0
S² - (E+G)S+EG-F²= ((E+G)+- sqrt((E-G)²-4F²))/2


We are also presented with I as 
I= [[fu*fu, fu*fv][fv*fu, fv*fv]]=[[E,F][F,G]]


On the second part we are explained that in SVD, the matrices J = U \Epsilon V^T of the svd store rotation and something else.

With this explanation we are also presented with sqrt(S_{1,2}) = alpha_{1,2}

Finally we get that U^T*J*V = \Epsilon

This is meant to help us do mesh parametrization somehow. We have a triangle with points P,R and Q and we are in a 2D space in X Y axes.
M*R = R'
M*Q=Q'

We solve for m_{1,1} m_{1,2} m_{2,1} m_{2,2}

M_1 = [[Qx Rx][Qy Ry]]
M_2 = [[Q'x R'x][Q'y R'y]]

So:
M_2 * M^{-1}_1 * Q
M_2 * [[1][0]] = Q'


We continue with an example of a circle that seems to have radius v.
||Mv||=Mv-Mv=(M*v)^T*Mv)=v^T(M^T*Mv); This will return sigma1 and sigma2

alpha1, alpha2 = sqrt(sigma_{1,2})
alpha_1 >alpha_2 and M=U[[alpha1, 0][0, alpha2]]V^T

(M^T * M)^T = (M^T*M^T)^T = M^T*M

## Isometry 
alpha_1, alpha_2 = 1

### Isometries
alpha_1  = alpha_2 = 1
transf, rotation, reflections

We call this transformations Rigid motions. 

All this are called Developable Surfaces, for example a cylinder (without caps). There are also Cones.

Developable means that <=> K=0

he also explained something about the horse chair "saddle or something" but i did not understand what he was trying to point out

Is really hard to find developable surfaces in practice. If we have a center point surrounded by points. The sum of all angles connected to v_0 should be less or equal to 2*pi. if i parametrize it in a plane, we can get an overlap or a gap if it is not equal to 2*pi. not really useful.


## Conformal?
(fv = fu * n)
alpha_1 = alpha_2

Each point has a condition that 

### Confomal maps
translations, rotations, isotropic scalings, reflections

They are Area preserving transformations are combinations of translations rotations and area preserving scalings. Scalings that satisy thsis restriction. We have this conditions but since we can not have it all, on one hand we can not look at this at all. In general there is an approximation approach. I have my mesh, i want the best parametrization posible, you have to determine what is best for that case. Instead of looking the behavior of the parametrization, you compose some formula :
E(aplha_1, alpha_2) = mu_c(Sigma_1-Sigma_2)

If you care about area preserving you would say:
mu*(1/sigma_1 * sigma 2, 1/sigma_2 * sigma_1)

There is a really old paper that did not look at this methods, "Tutte". 
#### Tutte
How to draw a graph: planar graphs and not planar graphs. Planar grarphs can be drawn without deformations. If you have a planar graph and you choose some nodes of the graph as vertices of some convex element, and you let all you're points on the graph to move to positins that minimize the stretch energy, they will move to positions where there are no intersections. It gives a disastrous parametrization if used in a mesh. FIrst day we were shoun images done with this algorithm. 

If we do a better choice of spring force, we may be able to improve the method. 

Imagine an interior point in some mesh called v_0. it has connections to different nodes and therefore there are angles (triangular mesh) that we can call alpha_i-1 and alpha_1. The way of correcting the flat laplace is taking into account the curvature of the surface. But the cotangent way has the problem that they maight be negative. negative weights are a problem. I want to define some coordinates for v_0 wehre v_0=sum(Sigma_i*vi); sum(Sigma_i)=1; 0<=Simga_i<1
This yields to parametrizations that have good properties. 

Floater proposed the scheme Mean Value Coordinates. Consider:
W_i = tan(a_{i-1}/2)+tan(a_i/2)/||v1_v0||; Sigma_i=W_i/sum(W_i). 

When taken an anamorphic function, we have nice angle preserving properties. This formula is derived from the functionality of a morphic function. We take a mesh (pyramid in this example to show it is not flat, it has volume) anamorphic to a disc. We have N vertices with some of them being bounding vertices [0,...,n_{-1}] and [n1,...,N-1] are the bounding points. (N-n-2)/vertices


## Area preservation (aretholic?)
determinant of the jacobian has to be equal to 1; alpha_1 * alpha_2 = 1

This is area preserving & angle preserving <=> isometry