# Alpha-Beta Pruning Algorithm

## Overview

Alpha-Beta Pruning is an optimization of the Minimax algorithm for two-player games like chess. It significantly reduces the number of nodes evaluated in the search tree by "pruning" branches that cannot affect the final decision.

## The Minimax Concept

In two-player zero-sum games:
- **Maximizing player (White)**: Wants to maximize the score
- **Minimizing player (Black)**: Wants to minimize the score
- Each player assumes the opponent plays optimally

### Minimax Algorithm

```
function minimax(position, depth, maximizingPlayer):
    if depth == 0 or game_over(position):
        return evaluate(position)
    
    if maximizingPlayer:
        maxEval = -∞
        for each child of position:
            eval = minimax(child, depth-1, false)
            maxEval = max(maxEval, eval)
        return maxEval
    else:
        minEval = +∞
        for each child of position:
            eval = minimax(child, depth-1, true)
            minEval = min(minEval, eval)
        return minEval
```

## Alpha-Beta Pruning

### Key Concept

Alpha-Beta maintains two values during the search:

- **Alpha (α)**: The best score the maximizer can guarantee (lower bound)
- **Beta (β)**: The best score the minimizer can guarantee (upper bound)

### Pruning Rule

When evaluating a node:
- If we find a move for the maximizer that gives `alpha >= beta`, the minimizer will never choose this branch (they have a better option elsewhere)
- If we find a move for the minimizer that gives `beta <= alpha`, the maximizer will never choose this branch

### Algorithm

```
function alphabeta(position, depth, α, β, maximizingPlayer):
    if depth == 0 or game_over(position):
        return evaluate(position)
    
    if maximizingPlayer:
        maxEval = -∞
        for each child of position:
            eval = alphabeta(child, depth-1, α, β, false)
            maxEval = max(maxEval, eval)
            α = max(α, eval)
            if β <= α:
                break  # β cutoff
        return maxEval
    else:
        minEval = +∞
        for each child of position:
            eval = alphabeta(child, depth-1, α, β, true)
            minEval = min(minEval, eval)
            β = min(β, eval)
            if β <= α:
                break  # α cutoff
        return minEval
```

## Example Walkthrough

```
        Max
       /   \
      3     Min
           / | \
          5  2  8

Without pruning: Evaluates all 5 leaf nodes
With pruning:    Evaluates only 3 nodes

When Min sees 5 and 2:
- Min will choose 2 (smallest)
- β = 2
- Max already has α = 3 from the left branch
- Since β (2) <= α (3), Max will never choose this branch
- Prune remaining nodes (8 never evaluated)
```

## Complexity Analysis

| Metric | Minimax | Alpha-Beta (worst) | Alpha-Beta (best) |
|--------|---------|-------------------|-------------------|
| Time   | O(b^d)  | O(b^d)            | O(b^(d/2))        |
| Space  | O(d)    | O(d)              | O(d)              |

Where:
- **b** = branching factor (typical chess position has ~35 moves)
- **d** = search depth

### Effective Branching Factor

With perfect move ordering:
- Alpha-Beta reduces effective branching from `b` to `√b`
- At depth 4: ~35^4 = 1.5M nodes → ~35^2 = 1,225 nodes evaluated

## Move Ordering

Move ordering is critical for maximizing pruning efficiency. Better moves should be searched first.

### Common Ordering Heuristics

1. **MVV-LVA (Most Valuable Victim - Least Valuable Attacker)**
   - Prioritize capturing high-value pieces with low-value pieces
   - Example: Capture Queen with Pawn before capturing Pawn with Queen
   - Formula: `score = 10 * victim_value - attacker_value`

2. **Killer Heuristic**
   - If a move caused a cutoff at the same depth elsewhere, try it first

3. **History Heuristic**
   - Track moves that have been good across all positions

4. **Principal Variation (PV)**
   - The best move from the previous iteration of iterative deepening

## Implementation Details

### Depth-Limited Search

Since chess has a huge game tree, we use depth-limited search:
- Search to a fixed depth
- Evaluate leaf nodes using a heuristic evaluation function
- Quiescence search can extend search for unstable positions

### Quiescence Search (Extension)

After reaching the depth limit, continue searching captures only:
- Avoids horizon effect (missing obvious tactics just beyond depth limit)
- Ensures we evaluate "quiet" positions where no immediate captures exist
