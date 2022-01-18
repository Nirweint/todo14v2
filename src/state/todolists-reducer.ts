import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";


type ActionsType = RemoveTodolistActionType | AddTodolistActionType
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | setTodolistsActionType

const initialState: Array<TodolistDomainType> = []

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.id)
        }
        case 'ADD-TODOLIST': {
            return [{
                id: action.todolistId,
                title: action.title,
                filter: 'all',
                addedDate: '',
                order: 0
            }, ...state]
        }
        case 'CHANGE-TODOLIST-TITLE': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.title = action.title;
            }
            return [...state]
        }
        case 'CHANGE-TODOLIST-FILTER': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.filter = action.filter;
            }
            return [...state]
        }
        case 'SET-TODOLISTS': {
            return action.todolists.map(tl => ({...tl, filter: 'all'}))
        }
        default:
            return state;
    }
}

export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export const removeTodolistAC = (todolistId: string) => {
    return {type: 'REMOVE-TODOLIST', id: todolistId} as const
}
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export const addTodolistAC = (title: string, todolistId: string) => {
    return {type: 'ADD-TODOLIST', title: title, todolistId} as const
}
export type ChangeTodolistTitleActionType = ReturnType<typeof changeTodolistTitleAC>
export const changeTodolistTitleAC = (id: string, title: string) => {
    return {type: 'CHANGE-TODOLIST-TITLE', id: id, title: title} as const
}
export type ChangeTodolistFilterActionType = ReturnType<typeof changeTodolistFilterAC>
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => {
    return {type: 'CHANGE-TODOLIST-FILTER', id: id, filter: filter} as const
}


export const setTodolistsAC = (todolists: TodolistType[]): setTodolistsActionType => {
    return {
        type: "SET-TODOLISTS",
        todolists,
    }
}

export type setTodolistsActionType = {
    type: "SET-TODOLISTS"
    todolists: TodolistType[]
}

// type setTodolistsActionType = ReturnType<typeof setTodolistsAC>


// THUNK
export const setTodolistsTC = () => (dispatch: Dispatch, getState: () => AppRootStateType, extraArguments: any): void => {
    // 1. side effect
    let promise = todolistsAPI.getTodolists()
    promise.then((res) => {
        let todolists = res.data
        // 2. dispatch action or another thunk
        dispatch(setTodolistsAC(todolists))
    })
}

export const createTodolistTC = (title: string) => (dispatch: Dispatch) => {
    let promise = todolistsAPI.createTodolist(title)
    promise.then((res) => {
        const newTodolistId = res.data.data.item.id
        dispatch(addTodolistAC(title, newTodolistId))
    })
}

export const removeTodolistTC = (todolistId: string) => (dispatch: Dispatch) => {
    let promise = todolistsAPI.deleteTodolist(todolistId)
    promise.then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(removeTodolistAC(todolistId))
        }
    })
}

export const updateTodolistTitleTC = (todolistId: string, title: string) => (dispatch: Dispatch) => {
    let promise = todolistsAPI.updateTodolist(todolistId, title)
    promise.then((res) => {
        if (res.data.resultCode === 0) {
            dispatch(changeTodolistTitleAC(todolistId, title))
        }
    })
}