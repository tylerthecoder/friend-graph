I thought I could put a place where I explain how some things work so I don't forget in the future

The main idea for the graphState is that it is not stored for each time. But actions are stored that modifies the graphState over time.

So there is a global called eventDiffs(ED). It is an array filled with objects that have a next and prev.
Next and Prev are of type event. An event contains the difference in time and all of the actions that need to be applied to the graph state.

There is not an array of GraphState(GS) since that would be way to big and very hard to deal with. To find the GS and index n you just start at ED[0] and keep applying the actions on ED[k].next. To put it formally

GS[0] = emptyGraphState = {}
GS[1] = applyEvent(ED[0].next, GS[0])
GS[n] = applyEvent(ED[n-1].next, GS[n-1])
