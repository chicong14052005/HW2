# Monte Carlo Tree Search (MCTS) Algorithm

## Overview

Monte Carlo Tree Search (MCTS) is a probabilistic search algorithm that makes decisions by performing random simulations. Unlike Alpha-Beta Pruning, which uses a static evaluation function, MCTS estimates the value of a move based on its win rate in simulated games.

## The 4 Stages of MCTS

MCTS operates in an iterative loop consisting of four main steps:

### 1. Selection
Starting at the root node, the algorithm navigates down the tree using the **Upper Confidence Bound (UCB1)** formula to balance exploration and exploitation.

### 2. Expansion
Unless the current node represents a terminal state, the algorithm adds one or more child nodes to the tree to explore new moves.

### 3. Simulation (Rollout)
From the newly added node, the algorithm performs a random simulation (play-out) until the game reaches a terminal state (win, loss, or draw).

### 4. Backpropagation
The result of the simulation is propagated back up to the root, updating the win counts and visit statistics for all ancestor nodes.

## UCB1 Formula

To choose the best node to explore, we use:
$$UCB1 = \frac{w_i}{n_i} + c \sqrt{\frac{\ln N}{n_i}}$$

Where:
- $w_i$: Number of wins for the node.
- $n_i$: Number of visits for the node.
- $N$: Total visits of the parent node.
- $c$: Exploration parameter (typically $\sqrt{2}$).

## Comparison with Alpha-Beta

| Feature | Alpha-Beta Pruning | MCTS |
|---------|-------------------|------|
| **Type** | Deterministic Depth Search | Probabilistic Simulation |
| **Evaluation** | Heuristic-based (PST, Piece Values) | Simulation-based (Win/Loss) |
| **Best For** | Tactics and material gains | Complex strategic depth |

## Implementation Details

Our implementation integrates with the custom `engine.board` and `engine.movelogic` to ensure consistency across the project:
- **`find_best_move`**: The main entry point for the GUI.
- **Random Policy**: Used during the simulation phase to reach game conclusions quickly.