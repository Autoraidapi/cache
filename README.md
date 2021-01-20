This is a deprecated api. Undesirable side effects may occur.


### Control Flow Test

- Store

prototype method `testPending`

- Model

prototype method `testPending` call to Store.testPending.then

- Template

prototype method `testPending`

- View

prototype method `testPending` call to Template.testPending.then

- Controller

prototype method `test` resolves `Model.testPending` and `View.testPending` using Memoization 


- Main

prototype method `test` linked to controller
