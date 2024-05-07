// tslint:disable-next-line:no-namespace
export namespace Status {
  export enum ApprovedStatus {
    Approved = 1,
    Pending = 2,
    Rejected = 3,
  }

  export enum SubtaskStatus {
    Incomplete = 0,
    Complete = 1,
  }

  export enum TaskStatus {
    Todo = 'ToDo',
    InProgress = 'InProgress',
    Completed = 'Completed',
  }
}
