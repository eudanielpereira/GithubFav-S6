import { GithubUser } from "./GithubUser.js"

// Classe que vai conter a lógica dos dados
// como os dados serão estruturados

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {  
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [] // O ('@...) DEVE SER O MESMO UTILIZADO NA FUNÇÃO DE SALVAR.
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries)) // para salva no localstorage. O NOME DO ('@...) DEVE SER O MESMO UTILIZADO ACIMA.
        // JSON.stringfy() transforma o objeto numa string
    }

    async add(username) { //async e await fazem a linha esperar para ser lida, aguarda uma promessa 
        try {

        const userExists = this.entries.find(entry => entry.login === username) // verifica se o usuário já está na aplicação
        
        if(userExists) { // caso o usuário já esteja cadastrado, retorna a mensagem de erro abaixo
            throw new Error('Usuário já cadastrado.')
        }

        const user = await GithubUser.search(username)

        if(user.login === undefined) { // se o usuário não existir, será undefined
            throw new Error('Usuário não encontrado.') // sendo undefined, dará erro e procurará o catch
        }

        this.entries = [user, ...this.entries] // adiciona o novo usuário e espalha os antigos. Ele mantém os antigos e add os outros
        this.update()
        this.save()


        } catch(error) {
            alert(error.message) //libera a mensagem de erro
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login) 

        this.entries = filteredEntries
        this.update()
        this.save() // salvar de novo em caso de delete para quando atualizar a page não voltar o usuário
    } 
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input') // tira de dentro do input somente o value, o {} desestrutura e pega somente o valor colocado no {}
            // o value é o que foi digitado no campo

            this.add(value)
        }
    }

    update() {
        this.removeAllTr() // chama a função de remover colunas

        this.entries.forEach( user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?')
                if(isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
    }

    createRow() { // criação da tr pelo js
        const tr = document.createElement('tr')  //cria um elemento pela DOM

        tr.innerHTML = ` 
            <td class="user">
                <img src="https://github.com/maykbrito.png" alt="Imagem de perfil">
                <a href="https://github.com/maykbrito" target="_blank">
                <p>Mayk Brito</p>
                <span>maykbrito</span>
                </a>
            </td>
            <td class="repositories">76</td>
            <td class="followers">9589</td>
            <td>
                <button class="remove">&times;</button>
            </td>     
       ` // insere o conteúdo dentro da tr

       return tr
    }

    removeAllTr() { // função para remover todas as colunas
        

        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        })
    }
}